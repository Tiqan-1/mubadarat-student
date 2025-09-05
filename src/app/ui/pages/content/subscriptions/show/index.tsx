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
import api, { getCurrentOrNextLevel, type LevelTask, type TaskLesson } from "@/app/api/services/subscriptions";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { LessonContentViewer } from "./LessonContentViewer";
import { formatDateLocale, isTaskLocked, SubscriptionTaskPlaylist } from "./SubscriptionTaskPlaylist";
import { SubscriptionBreadcrumb } from "./SubscriptionBreadcrumb";
import { TaskChat } from "./chat/TaskChat";
import { useSubscriptionState } from "../hooks/useSubscriptionState";

dayjs.locale("ar");
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isToday);
 

const { Content } = Layout;
 
// --- Helper Functions ---
const findNextLessonInTask = (
  task: LevelTask | undefined,
  currentLessonId: string | null
): TaskLesson | null => {
  if (!task || !currentLessonId || !task.lessons || task.lessons.length < 2)
    return null;
  const currentIndex = task.lessons.findIndex((l) => l.id === currentLessonId);
  if (currentIndex === -1 || currentIndex >= task.lessons.length - 1)
    return null;
  return task.lessons[currentIndex + 1];
};
const findNextUnlockedTask = (
  sortedTasks: LevelTask[],
  currentTaskId: string | null
): LevelTask | null => {
  if (!currentTaskId)
    return sortedTasks.find((t) => !isTaskLocked(t.date)) || null;
  const currentIndex = sortedTasks.findIndex((t) => t.id === currentTaskId);
  if (currentIndex === -1) return null;
  for (let i = currentIndex + 1; i < sortedTasks.length; i++) {
    if (!isTaskLocked(sortedTasks[i].date)) {
      return sortedTasks[i];
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
  selectedLesson: TaskLesson | undefined;
  onMarkComplete: () => void;
  isLoadingComplete: boolean;
  isCurrentTaskLocked: boolean;
  hasMoreContent: boolean;
}
const TaskActions: React.FC<TaskActionsProps> = ({
  selectedTask,
  selectedLesson,
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
  const downloadUrl = selectedLesson?.url;
  return (
    <div style={actionButtonsStyle}>
      
      <Space wrap>
        
        <Button
          icon={<DownloadOutlined />}
          href={downloadUrl}
          target="_blank"
          download
          disabled={!downloadUrl || isCurrentTaskLocked}
        >
          
          تحميل المرفق
        </Button>
      </Space>
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
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [activeCollapseKey, setActiveCollapseKey] = useState<string | string[] | undefined>(undefined);

	const { id } = useParams(); 
  const {data, isLoading, error} = useQuery({queryKey: [id], queryFn: () => api.get({id:id}), refetchOnWindowFocus:false});
  
  const { history, saveLastVisited, markLessonAsCompleted, getCompletedLessonsSet } = useSubscriptionState();

  const subscription = data?.items[0]

  // Get the completion set for the current subscription
  const completedLessons = useMemo(() => getCompletedLessonsSet(subscription?.id ?? null), [getCompletedLessonsSet, subscription?.id]);

  // Effect to set the initial state from history or default
  useEffect(() => {
    if (subscription && !selectedLevelId) {
      const savedState = history[subscription.id];
      if (savedState) {
        // If history exists, use it
        setSelectedLevelId(savedState.levelId);
        setSelectedTaskId(savedState.taskId);
        setSelectedLessonId(savedState.lessonId);
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
    if (subscription?.id && selectedLevelId && selectedTaskId && selectedLessonId) {
      saveLastVisited(subscription.id, {
        levelId: selectedLevelId,
        taskId: selectedTaskId,
        lessonId: selectedLessonId,
      });
    }
  }, [selectedLevelId, selectedTaskId, selectedLessonId, subscription?.id, saveLastVisited]);
  
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
    if (sortedTasks.length > 0 && !selectedTaskId) { // only run if taskId is not already set
        const firstUnlockedTask = sortedTasks.find((task) => !isTaskLocked(task.date));
        const taskToSelect = firstUnlockedTask || sortedTasks[0];
        if (taskToSelect) {
            setSelectedTaskId(taskToSelect.id);
            setActiveCollapseKey(taskToSelect.id);
            setSelectedLessonId(taskToSelect.lessons?.[0]?.id || null);
        }
    }
  }, [sortedTasks, selectedTaskId]);



  // Derive selected items
  const selectedTask = useMemo(() => sortedTasks.find((task) => task?.id === selectedTaskId), [selectedTaskId, sortedTasks]);
  const selectedLesson = useMemo(() => selectedTask?.lessons?.find((lesson) => lesson?.id === selectedLessonId), [selectedTask, selectedLessonId]);
  const isCurrentTaskLocked = useMemo(() => (selectedTask ? isTaskLocked(selectedTask.date) : true), [selectedTask]);

  const hasMoreContent = useMemo(() => {
    if (!selectedTaskId || !selectedTask || isCurrentTaskLocked) return false;
    if (findNextLessonInTask(selectedTask, selectedLessonId)) return true;
    if (findNextUnlockedTask(sortedTasks, selectedTaskId)) return true;
    return false;
  }, [selectedTask,selectedLessonId,sortedTasks,selectedTaskId,isCurrentTaskLocked]);

  // Handlers
  const togglePlaylist = () => setPlaylistVisible(!playlistVisible);
  const toggleChat = () => setIsChatVisible(!isChatVisible);
  const handleLevelChange = (levelId: string) => {
    setSelectedLevelId(levelId);
    // When level changes, clear task/lesson to let the useEffect above pick the first one
    setSelectedTaskId(null);
    setSelectedLessonId(null);
  };

  const handleLessonClick = (taskId: string, lessonId: string, isLocked: boolean) => {
    if (isLocked) { toast.warning("هذه المهمة مقفلة حالياً."); return; }
    setSelectedTaskId(taskId);
    setSelectedLessonId(lessonId);
    if (activeCollapseKey !== taskId) setActiveCollapseKey(taskId);
  };

  const handleCollapseChange = (key: string | string[]) => {
    const newActiveKey = typeof key === "string" ? key : Array.isArray(key) ? key[0] : undefined;
    setActiveCollapseKey(newActiveKey);
    // if (newActiveKey) {
    //   const task = sortedTasks.find((t) => t?.id === newActiveKey);
    //   if (task && !isTaskLocked(task.date)) {
    //     if (selectedTaskId !== newActiveKey) {
    //       setSelectedTaskId(newActiveKey);
    //       setSelectedLessonId(task.lessons?.[0]?.id || null);
    //     }
    //   }
    // }
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
    if (!subscription?.id || !selectedTaskId || !selectedLessonId || isLoadingComplete || isCurrentTaskLocked) return;
    
    // Keep a reference to the lesson ID being completed
    const lessonToCompleteId = selectedLessonId;

    // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
    const promise = new Promise<string>(async (resolve, reject) => {
      setIsLoadingComplete(true);
      await new Promise((res) => setTimeout(res, 1000));
      try {
        console.log(
          `API: Mark lesson ${selectedLessonId} of task ${selectedTaskId} complete`
        );
        resolve(selectedLesson?.title || "الدرس");
      } catch (error) {
        reject(error);
      }
    });
    toast.promise(promise, {
      loading: "جاري إكمال الدرس...",
      success: (lessonTitle) => {
        // MARK THE LESSON AS COMPLETED IN LOCAL STORAGE
        markLessonAsCompleted(subscription.id, lessonToCompleteId);

        setIsLoadingComplete(false);
        const nextLesson = findNextLessonInTask(selectedTask, selectedLessonId);
        if (nextLesson) {
          setSelectedLessonId(nextLesson.id);
          return `أكملت "${lessonTitle}". التالي.`;
        }
        const nextTask = findNextUnlockedTask(sortedTasks, selectedTaskId);
        if (nextTask) {
          setSelectedTaskId(nextTask.id);
          setSelectedLessonId(nextTask.lessons?.[0]?.id || null);
          setActiveCollapseKey(nextTask.id);
          return `أكملت مهمة ${formatDateLocale(selectedTask?.date || "")}. التالي.`;
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
      {selectedTask?.chatRoomId && (
        <TaskChat chatRoomId={selectedTask.chatRoomId} onClose={toggleChat} visible={isChatVisible} />
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
                <SubscriptionBreadcrumb subscription={subscription} level={currentLevel} selectedTask={selectedTask} selectedLesson={selectedLesson}/>
                <Space>
                  {!playlistVisible && (
                    <Button icon={<UnorderedListOutlined />} onClick={togglePlaylist} aria-label="عرض قائمة المهام">القائمة</Button>
                  )}
                </Space>
              </div>
              <LessonContentViewer lesson={selectedLesson} />
              <TaskActions
                selectedTask={selectedTask}
                selectedLesson={selectedLesson}
                onMarkComplete={handleMarkComplete}
                isLoadingComplete={isLoadingComplete}
                isCurrentTaskLocked={isCurrentTaskLocked}
                hasMoreContent={hasMoreContent}
              />
            </>
          )}
          {!isLoading && !error && !subscription && <Empty description="لم يتم العثور على بيانات الاشتراك." />}
        </Content>
      </Layout>
      {!isLoading && !error && subscription && (
        <SubscriptionTaskPlaylist
          allLevels={subscription.program.levels || []}
          selectedLevelId={selectedLevelId}
          onLevelChange={handleLevelChange}
          levelTasks={sortedTasks}
          selectedTaskId={selectedTaskId}
          selectedLessonId={selectedLessonId}
          completedLessons={completedLessons}
          visible={playlistVisible}
          activeCollapseKey={activeCollapseKey}
          onLessonClick={handleLessonClick}
          onCollapseChange={handleCollapseChange}
          onClose={togglePlaylist}
        />
      )}
    </Layout>
  );
};

export default SubscriptionTaskViewerPage;




// const mockSubscription: Subscription = {
//     "id":"68011f309b0cc2e8bac3e2ae",
//     "program":{
//        "id":"67fe34827d47dcd153437d8d",
//        "name":"صرح العربية",
//        "state":"published",
//        "thumbnail":"13a080b1-86b0-418a-8d0d-6a5509474c7d-Designer.png",
//        "description":"برنامج يهدف إلى رفع السوية اللغوية للطالب.\nيبدأ البرنامج تدريجيًا من الأسس البسيطة ليناسب الطالب المبتدئ تمامًا والمتوسط.",
//        "start":"2025-05-09T22:00:00.000Z",
//        "end":"2025-06-09T22:00:00.000Z",
//        "registrationStart":"2025-04-15T22:00:00.000Z",
//        "registrationEnd":"2025-05-09T22:00:00.000Z",
//        "levels": [
//           {
//             "id":"67fe34b07d47dcd153437d95",
//             "name":"المستوى الأول: مدخل إلى علوم العربية",
//             "start":"2025-05-09T22:00:00.000Z",
//             "end":"2025-05-18T22:00:00.000Z",
//             "programId":"67fe34827d47dcd153437d8d",
//             "tasks":[
//                 {
//                   "id":"67fe364d7d47dcd153437df0",
//                   "levelId":"67fe34b07d47dcd153437d95",
//                   "date":"2025-05-03T22:00:00.000Z",
//                   "note":"من البداية حتى الدقيقة 30",
//                   "lessons":[
//                       {
//                         "id":"67fe354f7d47dcd153437dac",
//                         "title":"المحاضرة الاولى - القسم الأول",
//                         "type":"video",
//                         "url":"https://youtu.be/1-RBbE3jffw?si=mxvlIWl0UtBgr-pT"
//                       },
//                       {
//                         "id":"67fe354f7d47dcd153437dacxx",
//                         "title":"المحاضرة 22 - القسم الأول",
//                         "type":"video",
//                         "url":"https://youtu.be/1-RBbE3jffw?si=mxvlIWl0UtBgr-pT"
//                       }
//                   ]
//                 },
//                 {
//                   "id":"67fe365a7d47dcd153437df8",
//                   "levelId":"67fe34b07d47dcd153437d95",
//                   "date":"2025-05-04T22:00:00.000Z",
//                   "lessons":[
//                       {
//                         "id":"67fe35627d47dcd153437db2",
//                         "title":"المحاضرة الاولى - القسم الثاني",
//                         "type":"video",
//                         "url":"https://youtu.be/qxL-8UK6pT4?si=E9VrieJ7W9a4F04G"
//                       }
//                   ]
//                 },
//                 {
//                   "id":"67fe36667d47dcd153437e01",
//                   "levelId":"67fe34b07d47dcd153437d95",
//                   "date":"2025-05-11T22:00:00.000Z",
//                   "lessons":[
//                       {
//                         "id":"67fe35787d47dcd153437db8",
//                         "title":"المحاضرة الثانية - القسم الأول",
//                         "type":"video",
//                         "url":"https://youtu.be/WshvbTd_PkM?si=DtTPYNUGxfiOEN-2"
//                       }
//                   ]
//                 },
//                 {
//                   "id":"67fe36817d47dcd153437e0b",
//                   "levelId":"67fe34b07d47dcd153437d95",
//                   "date":"2025-05-12T22:00:00.000Z",
//                   "lessons":[
//                       {
//                         "id":"67fe35957d47dcd153437dbe",
//                         "title":"المحاضرة الثانية - القسم الثاني",
//                         "type":"video",
//                         "url":"https://youtu.be/uwKLuI-kvL4?si=RcbNKzd_TgCawCmF"
//                       }
//                   ]
//                 },
//                 {
//                   "id":"67fe368d7d47dcd153437e16",
//                   "levelId":"67fe34b07d47dcd153437d95",
//                   "date":"2025-05-13T22:00:00.000Z",
//                   "lessons":[
//                       {
//                         "id":"67fe35c67d47dcd153437dc4",
//                         "title":"المحاضرة الثانية - القسم الثالث",
//                         "type":"video",
//                         "url":"https://youtu.be/7DyJZ_2pbRQ?si=3TBJIFWKvEVIRcpW"
//                       }
//                   ]
//                 },
//                 {
//                   "id":"67fe36ad7d47dcd153437e22",
//                   "levelId":"67fe34b07d47dcd153437d95",
//                   "date":"2025-05-14T22:00:00.000Z",
//                   "lessons":[
//                       {
//                         "id":"67fe35e27d47dcd153437dca",
//                         "title":"الصرف 1",
//                         "type":"video",
//                         "url":"https://youtu.be/gWycbthEEdU?si=1INpitP3rIsXOZjw"
//                       }
//                   ]
//                 },
//                 {
//                   "id":"67fe36c47d47dcd153437e2f",
//                   "levelId":"67fe34b07d47dcd153437d95",
//                   "date":"2025-05-16T22:00:00.000Z",
//                   "lessons":[
//                       {
//                         "id":"67fe35f97d47dcd153437dd0",
//                         "title":"الصرف 2",
//                         "type":"video",
//                         "url":"https://youtu.be/A3NcgzMvQ0E?si=MqKM3LM8vVZJ_89J"
//                       }
//                   ]
//                 },
//                 {
//                   "id":"67fe36d17d47dcd153437e3d",
//                   "levelId":"67fe34b07d47dcd153437d95",
//                   "date":"2025-05-17T22:00:00.000Z",
//                   "lessons":[
//                       {
//                         "id":"67fe36117d47dcd153437dd6",
//                         "title":"المحاضرة الأخيرة - القسم الأول",
//                         "type":"video",
//                         "url":"https://youtu.be/F8SN770zqhs?si=ymIQMcan3ZkyULLO"
//                       }
//                   ]
//                 },
//                 {
//                   "id":"67fe36e07d47dcd153437e4c",
//                   "levelId":"67fe34b07d47dcd153437d95",
//                   "date":"2025-05-18T22:00:00.000Z",
//                   "lessons":[
//                       {
//                         "id":"67fe36257d47dcd153437ddc",
//                         "title":"المحاضرة الأخيرة - القسم الثاني",
//                         "type":"video",
//                         "url":"https://youtu.be/vr1O51jWmk8?si=yvzj6c8gSnl3DQLi"
//                       }
//                   ]
//                 }
//             ]
//           }
//        ]
//     },
//     "subscriptionDate":"2025-04-16T12:48:40.005Z",
//     "state":"active"
//  } as Subscription;

