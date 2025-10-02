import type React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  Layout,
  Spin,
  Empty,
  Alert,
  Space,
  Button,
  Tooltip,
  Modal,
} from "antd";
import {
  UnorderedListOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  MessageOutlined,
} from "@ant-design/icons"; 
import dayjs from "dayjs";
import "dayjs/locale/ar";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isToday from "dayjs/plugin/isToday";

import {  toast } from "sonner";
import Joyride from 'react-joyride';
import api, { getCurrentOrNextLevel, getTaskItems, type PlaylistItem, type LevelTask } from "@/app/api/services/subscriptions";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { LessonContentViewer } from "./LessonContentViewer";
import { isTaskLocked, SubscriptionTaskPlaylist } from "./SubscriptionTaskPlaylist";
import { SubscriptionBreadcrumb } from "./SubscriptionBreadcrumb";
import { TaskChat } from "./chat/TaskChat";
import { useSubscriptionState } from "../hooks/useSubscriptionState";
import { usePlayerTour } from "./hooks/usePlayerTour";

dayjs.locale("ar");
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isToday);
 

const { Content } = Layout;
 
// --- Helper Functions ---
const findNextPlaylistItem = (
  sortedTasks: LevelTask[],
  currentTaskId: string | null,
  currentItemId: string | null,
): { nextItemId: string; nextTaskId: string } | null => {
  if (!currentTaskId || !currentItemId) return null;

  const currentTaskIndex = sortedTasks.findIndex((t) => t.id === currentTaskId);
  if (currentTaskIndex === -1) return null;
  
  const currentTask = sortedTasks[currentTaskIndex];
  const currentTaskItems = getTaskItems(currentTask);
  const currentItemIndex = currentTaskItems.findIndex((i) => i.id === currentItemId);

  // Look for the next item in the SAME task
  if (currentItemIndex > -1 && currentItemIndex < currentTaskItems.length - 1) {
    const nextItem = currentTaskItems[currentItemIndex + 1];
    return { nextItemId: nextItem.id, nextTaskId: currentTask.id };
  }

  // Look for the first item in the NEXT unlocked task
  for (let i = currentTaskIndex + 1; i < sortedTasks.length; i++) {
    const nextTask = sortedTasks[i];
    if (!isTaskLocked(nextTask.date)) {
      const nextTaskItems = getTaskItems(nextTask);
      if (nextTaskItems.length > 0) {
        return { nextItemId: nextTaskItems[0].id, nextTaskId: nextTask.id };
      }
    }
  }

  return null;
};
const simulateNavigate = (path: string) => {
  toast.info(`Navigating to: ${path}`);
  window.location.href = `#${path}`;
};


// ========================================
// Actions Component
// ========================================
interface TaskActionsProps {
  selectedTask: LevelTask | undefined;
  selectedItem: PlaylistItem | undefined;
  onMarkComplete: () => void;
  isLoadingComplete: boolean;
  isCurrentTaskLocked: boolean;
  hasMoreContent: boolean;
}
const TaskActions: React.FC<TaskActionsProps> = ({
  selectedTask,
  selectedItem,
  onMarkComplete,
  isLoadingComplete,
  isCurrentTaskLocked,
  hasMoreContent,
}) => {
  const actionButtonsStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    padding: "16px 0",
    borderTop: "1px solid #f0f0f0",
    marginTop: "auto",
  };
  return (
    <div style={actionButtonsStyle}>
      
      { selectedItem?.itemType==='lesson' && (
        <Space wrap>
        
        <Button
          icon={<DownloadOutlined />}
          href={selectedItem?.url}
          target="_blank"
          download
          disabled={!selectedItem?.url || isCurrentTaskLocked}
        >
          
          تحميل المرفق
        </Button>
      </Space>
      )}

      <Tooltip title={isCurrentTaskLocked ? "لا يمكنك إكمال مهمة مقفلة" : ""}>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={onMarkComplete}
          loading={isLoadingComplete}
          disabled={isLoadingComplete || !selectedTask || isCurrentTaskLocked}
        >
          
          {isLoadingComplete
            ? "جاري..."
            : hasMoreContent
            ? "إكمال والمتابعة"
            : "إنهاء المهمة الأخيرة"}
        </Button>
      </Tooltip>
    </div>
  );
};
 

// ========================================
// Main Page Component
// ========================================
const SubscriptionTaskViewerPage: React.FC = () => {

  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [playlistVisible, setPlaylistVisible] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [activeCollapseKey, setActiveCollapseKey] = useState<string | string[] | undefined>(undefined);

	const { id } = useParams(); 
  const {data, isLoading, error} = useQuery({queryKey: [id], queryFn: () => api.get({id:id}), refetchOnWindowFocus:false});
  
  const { history, saveLastVisited, markItemAsCompleted, getCompletedItemsSet } = useSubscriptionState();

  const subscription = data?.items[0]

  const completedItems = useMemo(() => getCompletedItemsSet(subscription?.id ?? null), [getCompletedItemsSet, subscription?.id]);

  // Effect to set the initial state from history or default
  useEffect(() => {
    if (subscription && !selectedLevelId) {
      const savedState = history[subscription.id];
      if (savedState) {
        // If history exists, use it
        setSelectedLevelId(savedState.levelId);
        setSelectedTaskId(savedState.taskId);
        setSelectedItemId(savedState.itemId);
        setActiveCollapseKey(savedState.taskId);
      } else {
        // Otherwise, fall back to the default logic
        const initialLevel = getCurrentOrNextLevel(subscription);
        if (initialLevel) {
          setSelectedLevelId(initialLevel.id);
        } else if (subscription.program?.levels?.[0]) {
          setSelectedLevelId(subscription.program.levels[0].id);
        }
      }
    }
  }, [subscription, history, selectedLevelId]);
  
  // Effect to SAVE the current position whenever it changes
  useEffect(() => {
    if (subscription?.id && selectedLevelId && selectedTaskId && selectedItemId) {
      saveLastVisited(subscription.id, {
        levelId: selectedLevelId,
        taskId: selectedTaskId,
        itemId: selectedItemId,
      });
    }
  }, [selectedLevelId, selectedTaskId, selectedItemId, subscription?.id, saveLastVisited]);
  
  // Derive the current level object based on the selected ID
  const currentLevel = useMemo(() => {
    if (!subscription || !selectedLevelId) return undefined;
    return subscription.program.levels.find(l => l.id === selectedLevelId);
  }, [subscription, selectedLevelId]);
  
  // Derive and sort tasks from the *current* level
  const sortedTasks = useMemo(() => {
    if (!currentLevel?.tasks) return [];
    return [...currentLevel.tasks].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  }, [currentLevel]);

  // handling level changes
  useEffect(() => {
    if (sortedTasks.length > 0 && !selectedTaskId) {
        const firstUnlockedTask = sortedTasks.find((task) => !isTaskLocked(task.date));
        const taskToSelect = firstUnlockedTask || sortedTasks[0];
        if (taskToSelect) {
            const firstItem = getTaskItems(taskToSelect)[0];
            setSelectedTaskId(taskToSelect.id);
            setActiveCollapseKey(taskToSelect.id);
            setSelectedItemId(firstItem?.id || null);
        }
    }
  }, [sortedTasks, selectedTaskId]);



  // Derive selected items

  const selectedTask = useMemo(() => sortedTasks.find((task) => task?.id === selectedTaskId), [selectedTaskId, sortedTasks]);
  
  // Derive the selected item (item or assignment)
  const selectedItem = useMemo(() => {
    if (!selectedTask || !selectedItemId) return undefined;
    return getTaskItems(selectedTask).find(item => item.id === selectedItemId);
  }, [selectedTask, selectedItemId]);
  
  

  const isCurrentTaskLocked = useMemo(() => (selectedTask ? isTaskLocked(selectedTask.date) : true), [selectedTask]);

  const hasMoreContent = useMemo(() => {
    return findNextPlaylistItem(sortedTasks, selectedTaskId, selectedItemId) !== null;
  }, [sortedTasks, selectedTaskId, selectedItemId]);
  

  // Player Tour
  const { joyrideProps } = usePlayerTour({
    isDataLoaded: !!subscription,
    selectedTask,
    setIsChatVisible,
    setPlaylistVisible,
  });

  // Handlers
  const togglePlaylist = () => setPlaylistVisible(!playlistVisible);
  const toggleChat = () => setIsChatVisible(!isChatVisible);

  const handleLevelChange = (levelId: string) => {
    setSelectedLevelId(levelId);
    // When level changes, clear task/item to let the useEffect above pick the first one
    setSelectedTaskId(null);
    setSelectedItemId(null);
  };

  const handleItemClick = (taskId: string, itemId: string, isLocked: boolean) => {
    if (isLocked) { toast.warning("هذه المهمة مقفلة حالياً."); return; }
    setSelectedTaskId(taskId);
    setSelectedItemId(itemId);
    if (activeCollapseKey !== taskId) setActiveCollapseKey(taskId);
  };

  const handleCollapseChange = (key: string | string[]) => {
    const newActiveKey = typeof key === "string" ? key : Array.isArray(key) ? key[0] : undefined;
    setActiveCollapseKey(newActiveKey);
  };

  const showCompletionModal = () => {
    Modal.success({
      title: "تهانينا!",
      content: "لقد أكملت جميع المهام المتاحة حالياً في هذا المستوى.",
      okText: "العودة للرئيسية",
      onOk: () => simulateNavigate("/"),
      direction: "rtl",
      icon: <CheckCircleOutlined />,
    });
  };

  const handleMarkComplete = () => {
    if (!subscription?.id || !selectedTaskId || !selectedItemId || isLoadingComplete || isCurrentTaskLocked){
       return;
    }
    
    // Keep a reference to the item ID being completed
    const itemToCompleteId = selectedItemId;

    // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
    const promise = new Promise<string>(async (resolve, reject) => {
      setIsLoadingComplete(true);
      await new Promise((res) => setTimeout(res, 1000));
      try {
        console.log(
          `API: Mark item ${selectedItemId} of task ${selectedTaskId} complete`
        );
        resolve(selectedItem?.title || "الدرس");
      } catch (error) {
        reject(error);
      }
    });
    toast.promise(promise, {
      loading: "جاري إكمال المهمة...",
      success: (itemTitle) => {
        // MARK THE ITEM AS COMPLETED IN LOCAL STORAGE
        markItemAsCompleted(subscription.id, itemToCompleteId);
        setIsLoadingComplete(false);
        
        const nextItemInfo = findNextPlaylistItem(sortedTasks, selectedTaskId, itemToCompleteId);

        if (nextItemInfo) {
          setSelectedTaskId(nextItemInfo.nextTaskId);
          setSelectedItemId(nextItemInfo.nextItemId);
          // If the task changed, update the active collapse key
          if (nextItemInfo.nextTaskId !== selectedTaskId) {
            setActiveCollapseKey(nextItemInfo.nextTaskId);
          }
          return `أكملت "${itemTitle}". التالي.`;
        }
        
        showCompletionModal();
        return "أكملت آخر مهمة متاحة!";
      },
      error: (err) => {
        setIsLoadingComplete(false);
        console.error("Completion error:", err);
        return "فشل إكمال الدرس.";
      },
    });
  };

  // Styles
  const mainLayoutStyle: React.CSSProperties = { minHeight: "100vh", flexDirection: 'row' };
  const contentStyle: React.CSSProperties = {
    padding: "24px",
    minHeight: "calc(100vh - 64px)",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  };
  const topBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "16px",
  };

  return (
    <Layout style={mainLayoutStyle}>
      
      <Joyride {...joyrideProps} />
      {/* <Joyride steps={tourSteps} run={runTour} callback={handleJoyrideCallback} continuous showProgress showSkipButton locale={{ back: 'السابق', close: 'إغلاق', last: 'إنهاء', next: 'التالي', skip: 'تخطي', nextLabelWithProgress: ("التالي ({step}/{steps})") ,}} styles={{ options: { zIndex: 10000, arrowColor: '#333', backgroundColor: '#333', primaryColor: '#1677ff', textColor: '#fff', }, }} /> */}
      
      {selectedTask?.chatRoomId && (
        <div className="tour-step-chat">
          <TaskChat chatRoomId={selectedTask.chatRoomId} onClose={toggleChat} visible={isChatVisible} />
        </div>
      )}
      
      <Layout>
        <Content style={contentStyle}>
          {isLoading && <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" tip="جاري تحميل..." /></div>}
          {error && !isLoading && <Alert message="خطأ في تحميل البيانات" description={error.message} type="error" showIcon style={{ marginBottom: "24px" }}/>}
          {!isLoading && !error && subscription && (
            <>
              <div style={topBarStyle}>
                <Space>
                  {selectedTask?.chatRoomId && !isChatVisible && (
                    <Button icon={<MessageOutlined />} onClick={toggleChat} aria-label="عرض المحادثة">المحادثة</Button>
                  )}
                </Space>
                <SubscriptionBreadcrumb subscription={subscription} level={currentLevel} selectedTask={selectedTask} selectedItem={selectedItem}/>
                <Space>
                  {!playlistVisible && (
                    <Button icon={<UnorderedListOutlined />} onClick={togglePlaylist} aria-label="عرض قائمة المهام">القائمة</Button>
                  )}
                </Space>
              </div>
              <div className="tour-step-content">
                  <LessonContentViewer item={selectedItem} />
              </div>
              <div className="tour-step-actions">
                <TaskActions
                  selectedTask={selectedTask}
                  selectedItem={selectedItem}
                  onMarkComplete={handleMarkComplete}
                  isLoadingComplete={isLoadingComplete}
                  isCurrentTaskLocked={isCurrentTaskLocked}
                  hasMoreContent={hasMoreContent}
                />
              </div>
            </>
          )}
          {!isLoading && !error && !subscription && <Empty description="لم يتم العثور على بيانات الاشتراك." />}
        </Content>
      </Layout>

      {!isLoading && !error && subscription && (
        <div className="tour-step-playlist">
          <SubscriptionTaskPlaylist
            allLevels={subscription.program.levels || []}
            selectedLevelId={selectedLevelId}
            onLevelChange={handleLevelChange}
            levelTasks={sortedTasks}
            selectedTaskId={selectedTaskId}
            selectedItemId={selectedItemId}
            completedItems={completedItems}
            visible={playlistVisible}
            activeCollapseKey={activeCollapseKey}
            onItemClick={handleItemClick}
            onCollapseChange={handleCollapseChange}
            onClose={togglePlaylist}
          />
        </div>
      )}

    </Layout>
  );
};

export default SubscriptionTaskViewerPage;