import type React from 'react';
import { Card, Typography, Space, Tag, Button, Modal } from 'antd';
import {
    CalendarOutlined,
    UnorderedListOutlined, // Or CheckSquareOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs'; // Using dayjs for date formatting
import 'dayjs/locale/ar'; // Import locale if needed globally
import type { Level } from '@/app/api/services/programs';
import subscriptionsApi from "@/app/api/services/subscriptions";
import { type Dispatch, type SetStateAction, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { t } from 'i18next';

dayjs.locale('ar'); // Set locale for formatting

const { Text, Title } = Typography;
 

interface LevelCardProps {
    level: Level;
    // Add onClick or other props if needed
    // onClick?: (level: Level) => void;
}

// --- Helper Function for Date Formatting ---
const formatLevelDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "غير محدد";
    try {
        const d = dayjs(dateString);
        if (!d.isValid()) return "تاريخ غير صالح";
        // Example format: "الأربعاء, ٢٤ أبريل ٢٠٢٥"
        return d.format('dddd, D MMMM YYYY');
    } catch (e) {
        return "خطأ";
    }
};

// --- The Card Component ---
const LevelItemCard: React.FC<LevelCardProps> = ({ level }) => {
    const [modalOpen, setModalOpen] = useState(false);

    // Safely get task count
    const taskCount = level.tasks?.length || 0;

    // const handleCardClick = () => {
    //     if (onClick) {
    //         onClick(level);
    //     }
    // };
    const handleCardClick = () => {
      console.log("Clicked level:", level);
      // navigate(`/levels/${id}`);
      setModalOpen(true);
    };

    return (
        <Card
            // hoverable={!!onClick} // Make card hoverable only if onClick is provided 
            style={{ marginBottom: '16px', direction: 'rtl' }} // Add margin and ensure RTL
            title={<Title level={5} style={{ margin: 0 }}>{level.name || "مستوى بدون اسم"}</Title>}
            actions={[
              <Button key="subscribe" size="large" onClick={handleCardClick} 
                        style={{ background: '#fff', color: level.isSubscribed ? '#e50d0d':'#18a978', fontWeight: 'bold', border: 'none' }}
                        >
               {level.isSubscribed ? 'إلغاء الإشتراك': 'إشترك'} 
              </Button>
            ]}
        >
            <SubscriptionModal level={level} open={modalOpen} setOpen={setModalOpen}  />
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* Dates Section */}
                <Space direction="vertical" >
                    <Text type="secondary">
                        <CalendarOutlined style={{ marginLeft: '8px' }} />
                        فترة المستوى:
                    </Text>
                    <Text>
                        <Tag color="green">{formatLevelDate(level.start)}</Tag>
                         إلى
                        <Tag color="red" style={{ marginRight: '5px' }}>{formatLevelDate(level.end)}</Tag>
                    </Text>
                </Space>

                 {/* Creator Section */}
                 {/* {level.createdBy && (
                     <Space>
                         <Tooltip title={level.createdBy.email || ''}>
                             <UserOutlined style={{ marginLeft: '8px', color: '#888' }} />
                         </Tooltip>
                         <Text type="secondary">إنشاء بواسطة:</Text>
                         <Text strong>{level.createdBy.name || 'غير معروف'}</Text>
                     </Space>
                 )} */}

                {/* Task Count Section */}
                <Space>
                    <UnorderedListOutlined style={{ marginLeft: '8px', color: '#888' }} />
                    <Text type="secondary">عدد المهام:</Text>
                    <Tag color="blue">{taskCount}</Tag>
                </Space>

                 {/* Add other relevant info if needed */}

            </Space>
        </Card>
    );
};

export default LevelItemCard; 





function SubscriptionModal({ level, open, setOpen}: { level: Level, open:boolean, setOpen: Dispatch<SetStateAction<boolean>>}) {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState(level.isSubscribed ? t('app.actions.confirm-unsubscription') : t('app.actions.confirm-subscription'));
    // const {data:subscriptionsList} = useQuery({queryKey: ['subscriptions', level], queryFn: () => subscriptionsApi.get({programId:id}), refetchOnWindowFocus:false});
    const subscriptionAction = useMutation({
		mutationFn: () => {
			// console.log('subscription: ', !level.isSubscribed);
			return level.isSubscribed ? 
            subscriptionsApi.destroy( level.id ) :  
            subscriptionsApi.create({levelId: level.id, programId: level.programId!});
		},
		onSuccess() { 
		},
	})
    
    const handleOk = () => {
        subscriptionAction.mutate()
      setModalText(level.isSubscribed ? t('app.actions.unsubscription is in progress') : t('app.actions.subscription is in progress'));
      setConfirmLoading(true);
      setTimeout(() => {
        setOpen(false);
        setConfirmLoading(false);
      }, 2000);
    };
  
    const handleCancel = () => {
      console.log('Clicked cancel button');
      setOpen(false);
    };
  
    return ( 
        <Modal
          key={`modal${level.id}`}
          title={level.name}
          open={open}
          onOk={handleOk}
          footer={[
            <Button key="back" onClick={handleCancel}>
            {t('common.close')} 
            </Button>,
            <Button key="submit" 
                danger={level.isSubscribed}
                type="primary"
                loading={subscriptionAction.isPending} 
                onClick={handleOk}>
            {t('common.ok')} 
            </Button>
          ]}
          confirmLoading={confirmLoading}
          onCancel={handleCancel}
        >
          <p>{modalText}</p>
        </Modal> 
    );
  };