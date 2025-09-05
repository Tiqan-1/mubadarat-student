import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Layout, List, Input, Button, Spin, Empty, Avatar, Tooltip, Alert, Typography } from 'antd';
import { RightOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import chatApi, { type Message, type Sender } from '@/app/api/services/chat';
import { pusherClient } from '@/app/lib/pusher';
import styles from './TaskChat.module.css';

const { Sider } = Layout;
const { Title } = Typography;

dayjs.extend(relativeTime);
dayjs.locale('ar');

interface TaskChatProps {
  chatRoomId: string;
  visible: boolean;
  onClose: () => void;
}

const mockCurrentUser: Sender = {
  name: 'الطالب الحالي',
  email: 'student@example.com',
};

const chatQueryKey = (chatRoomId: string) => ['chat', chatRoomId];

export const TaskChat: React.FC<TaskChatProps> = ({ chatRoomId, visible, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const listEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const isInitialLoad = useRef(true);

  const { data: chatData, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: chatQueryKey(chatRoomId),
    queryFn: () => chatApi.join(chatRoomId),
    enabled: !!chatRoomId && visible,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const messages = chatData?.messages ?? [];

  useEffect(() => {
    if (!visible) {
      isInitialLoad.current = true;
    }
  }, [visible]);

  useEffect(() => {
    if (!chatRoomId || !pusherClient) return;
    const channel = pusherClient.subscribe(`${chatRoomId}`);
    const handleNewMessage = (data: any) => {
      console.log("handleNewMessage")
      console.log(data)
      if (typeof data?.chunk !== 'string') {
        console.warn("Received a Pusher message with an unexpected format:", data);
        return;
      }

      try {
        const parsedChunk = JSON.parse(data.chunk);

        const finalMessage: Message = {
          id: data.id || `pusher-${Date.now()}`,
          text: parsedChunk.message,
          sender: parsedChunk.sender,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Prevent adding echo of our own message if the backend broadcasts it back
        if (finalMessage.sender.email === mockCurrentUser.email) {
          return;
        }

        // Update the React Query cache with the correctly formatted message
        queryClient.setQueryData<any>(chatQueryKey(chatRoomId), (oldData: any) => {
          const existingMessages = oldData?.messages ?? [];
          if (existingMessages.some((msg: Message) => msg.id === finalMessage.id)) {
            return oldData;
          }
          return { ...oldData, messages: [...existingMessages, finalMessage] };
        });

      } catch (e) {
        console.error("Failed to parse Pusher message chunk:", e);
      }
    };
    channel.bind('message', handleNewMessage);
    return () => {
      channel.unbind('message', handleNewMessage);
      pusherClient.unsubscribe(`${chatRoomId}`);
    };
  }, [chatRoomId, queryClient]);

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: (text: string) => {
      const socketId = pusherClient.connection.socket_id;
      if (!socketId) throw new Error("Pusher connection not established.");
      return chatApi.send(chatRoomId, { message: text, socketId });
    },
    onSuccess: (_data, sentText) => {
      setNewMessage('');

      const manualMessage: Message = {
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        text: sentText,
        sender: mockCurrentUser,
      };

      // Update the cache immediately
      queryClient.setQueryData<any>(chatQueryKey(chatRoomId), (oldData: any) => {
        const existingMessages = oldData?.messages ?? [];
        return {
          ...oldData,
          messages: [...existingMessages, manualMessage],
        };
      });
    },
    onError: (err: any) => {
      console.error("Failed to send message:", err);
      toast.error('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage.trim());
  };
 
  useEffect(() => {
    if (!isSuccess || messages.length === 0) return;
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    const container = listEndRef.current;
    if (container) {
      // Use a small timeout to ensure the DOM has updated before we scroll
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }, 50); // 50ms is a safe delay
    }
  }, [messages, isSuccess]);

  const renderContent = () => {
    if (isLoading) return <div className={styles.centered}><Spin tip="جاري تحميل الرسائل..." /></div>;
    if (isError) return <div className={styles.centered}><Alert message="خطأ في تحميل المحادثة" description={error.message} type="error" /></div>;
    if (messages.length === 0) return <div className={styles.centered}><Empty description="لا توجد رسائل بعد. كن أول من يبدأ النقاش!" /></div>;
    return (
      <List
        className={styles.messageList}
        dataSource={messages}
        renderItem={(item) => {
          const isCurrentUser = (item.sender.email) === mockCurrentUser.email;
          const messageContainerClass = isCurrentUser ? styles.myMessageContainer : styles.theirMessageContainer;
          return (
            <List.Item className={`${styles.messageItem} ${messageContainerClass}`}>
              <div className={styles.messageWrapper}>
                {!isCurrentUser && <Avatar className={styles.avatar}>{item.sender.name.charAt(0).toUpperCase()}</Avatar>}
                <div className={styles.messageContent}>
                  {!isCurrentUser && <div className={styles.senderName}>{item.sender.name}</div>}
                  <div className={styles.messageBubble}><p className={styles.messageText}>{item.text}</p></div>
                  <Tooltip title={dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}>
                    <span className={styles.messageTimestamp}>{dayjs(item.createdAt).fromNow()}</span>
                  </Tooltip>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    );
  };

  const siderStyle: React.CSSProperties = {
    background: "#fff",
    height: "100vh",
    overflowY: "auto",
    padding: "10px",
    transition: "all 0.2s ease-in-out",
    borderLeft: "1px solid #f0f0f0",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #f0f0f0",
    flexShrink: 0,
  };

  return (
    <Sider
      width={350}
      theme="light"
      collapsible
      collapsed={!visible}
      trigger={null}
      collapsedWidth={0}
      style={siderStyle}
    >
      <div className={styles.siderLayout}>
        <div style={headerStyle}>
          <Title level={5} style={{ margin: 0 }}>محادثة المهمة</Title>
          <Button icon={<RightOutlined />} onClick={onClose} type="text" aria-label="إخفاء المحادثة" />
        </div>

        <div className={styles.chatContentContainer}  ref={listEndRef}>
          {renderContent()} 
        </div>

        <div className={styles.chatInputArea} >
          <Input.TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder="اكتب رسالتك هنا..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={isSending || isLoading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={isSending}
            disabled={!newMessage.trim() || isSending}
          />
        </div>
      </div>
    </Sider>
  );
};