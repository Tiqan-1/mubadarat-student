import type React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  Layout,
  Typography,
  List,
  Spin,
  Empty,
  Collapse,
  Alert,
  Space,
  Button,
  Breadcrumb,
  Tooltip,
  Modal,
} from "antd";
import {
  CalendarOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  AudioOutlined,
  FileWordOutlined,
  LinkOutlined,
  UnorderedListOutlined,
  ReadOutlined,
  BookOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  RightOutlined,
  PlayCircleOutlined,
  LockOutlined,
} from "@ant-design/icons"; 
import dayjs from "dayjs";
import "dayjs/locale/ar";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isToday from "dayjs/plugin/isToday";

import {  toast } from "sonner"; // Using Sonner
import api, { getCurrentOrNextLevel, type LevelTask, type Subscription, type TaskLesson } from "@/app/api/services/subscriptions";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

dayjs.locale("ar");
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isToday);
 

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
 

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


// --- Helper Functions ---
const getLessonIcon = (type: TaskLesson["type"]): React.ReactNode => {
  switch (type) {
    case "video":
    case "embedded":
      return <VideoCameraOutlined />;
    case "pdf":
      return <FilePdfOutlined />;
    case "audio":
      return <AudioOutlined />;
    case "docx":
      return <FileWordOutlined />;
    default:
      return <LinkOutlined />;
  }
};
const formatDateLocale = (dateString: string | undefined | null): string => {
  if (!dateString) return "تاريخ غير محدد";
  try {
    const d = dayjs(dateString);
    if (!d.isValid()) {
      console.warn("Invalid date passed to formatDateLocale:", dateString);
      return "تاريخ غير صالح";
    }
    return d.format("dddd, D MMMM YYYY");
  } catch (e) {
    console.error("formatDateLocale Error:", dateString, e);
    return "خطأ في التاريخ";
  }
};
function getYouTubeId(url: string): string | null {
  try {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  } catch (e) {
    return null;
  }
}
function getEmbedUrl(
  lessonUrl: string,
  lessonType: TaskLesson["type"]
): string | null {
  if (!lessonUrl) return null;
  if (lessonType === "embedded" || lessonType === "video") {
    const youtubeId = getYouTubeId(lessonUrl);
    if (youtubeId)
      return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&hl=ar&enablejsapi=1`;
  }
  if (lessonType === "pdf") return lessonUrl;
  return null;
}
const isTaskLocked = (taskDate: string | undefined | null): boolean => {
  if (!taskDate) return true;
  try {
    const taskDay = dayjs(taskDate);
    if (!taskDay.isValid()) return true;
    return taskDay.isAfter(dayjs(), "day");
  } catch (e) {
    return true;
  }
};
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
// Playlist Component
// ========================================
interface SubscriptionTaskPlaylistProps {
  levelTasks: LevelTask[];
  selectedTaskId: string | null;
  selectedLessonId: string | null;
  visible: boolean;
  activeCollapseKey: string | string[] | undefined;
  onLessonClick: (taskId: string, lessonId: string, isLocked: boolean) => void;
  onCollapseChange: (key: string | string[]) => void;
  onClose: () => void;
}
const SubscriptionTaskPlaylist: React.FC<SubscriptionTaskPlaylistProps> = ({
  levelTasks,
  selectedTaskId,
  selectedLessonId,
  visible,
  activeCollapseKey,
  onLessonClick,
  onCollapseChange,
  onClose,
}) => {
  const siderStyle: React.CSSProperties = {
    background: "#f0f2f5",
    padding: "10px",
    height: "calc(100vh - 64px)",
    overflowY: "auto",
    transition: "all 0.2s ease-in-out",
    borderRight: "1px solid #e8e8e8",
  };
  const playlistHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid #e0e0e0",
  };
  const lessonItemStyleBase: React.CSSProperties = {
    padding: "8px 12px",
    cursor: "pointer",
    borderRadius: "4px",
    marginBottom: "4px",
    transition: "background-color 0.2s ease, color 0.2s ease",
    backgroundColor: "transparent",
    color: "rgba(0, 0, 0, 0.85)",
    display: "flex",
    alignItems: "center",
  };
  const lessonItemStyleSelected: React.CSSProperties = {
    ...lessonItemStyleBase,
    backgroundColor: "#1890ff",
    color: "#fff",
    fontWeight: 500,
  };
  const lessonItemStyleLocked: React.CSSProperties = {
    ...lessonItemStyleBase,
    cursor: "not-allowed",
    color: "#aaa",
    backgroundColor: "#fafafa",
  };
  const panelHeaderStyleBase: React.CSSProperties = {
    fontWeight: 400,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  };
  const panelHeaderStyleActive: React.CSSProperties = {
    ...panelHeaderStyleBase,
    fontWeight: 600,
    color: "#1890ff",
  };
  const panelHeaderStyleLocked: React.CSSProperties = {
    ...panelHeaderStyleBase,
    color: "#aaa",
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
      <div style={playlistHeaderStyle}>
        {" "}
        <Title level={5} style={{ margin: 0 }}>
          مهام المستوى
        </Title>{" "}
        <Button
          icon={<RightOutlined />}
          onClick={onClose}
          type="text"
          aria-label="إخفاء القائمة"
        />{" "}
      </div>
      <Collapse
        accordion
        activeKey={activeCollapseKey}
        onChange={onCollapseChange}
      >
        {levelTasks.map((task, taskIndex) => {
          // --- Defensive check for task and task.date before rendering Panel ---
          if (!task || !task.id) {
            console.warn("Skipping rendering of invalid task object:", task);
            return null; // Don't render anything for an invalid task
          }
          // We still rely on the helper for lock status, which now handles bad dates
          const isLocked = isTaskLocked(task.date);
          const formattedDate = formatDateLocale(task.date); // Get formatted date or fallback
          // --------------------------------------------------------------------------

          const headerStyle = isLocked
            ? panelHeaderStyleLocked
            : task.id === selectedTaskId
            ? panelHeaderStyleActive
            : panelHeaderStyleBase;

          return (
            <Panel
              key={task.id} // Use the guaranteed valid task.id
              collapsible={isLocked ? "disabled" : undefined}
              header={
                // Construct header content safely
                <div style={headerStyle}>
                  <Space direction="vertical" size={0}>
                    <Text style={{ color: "inherit" }}>
                      {" "}
                      {taskIndex + 1}. {formattedDate}{" "}
                    </Text>
                    {task.note && (
                      <Text type="secondary" style={{ fontSize: "0.85em" }}>
                        {task.note}
                      </Text>
                    )}
                  </Space>
                  {isLocked && <LockOutlined style={{ fontSize: "14px" }} />}
                </div>
              }
            >
              <List
                size="small"
                dataSource={task.lessons || [] /* Ensure lessons is an array */}
                renderItem={(lesson) => {
                  // --- Defensive check for lesson and lesson.id ---
                  if (!lesson || !lesson.id) {
                    console.warn(
                      "Skipping rendering of invalid lesson object:",
                      lesson
                    );
                    return null;
                  }
                  // ------------------------------------------------------
                  const isLessonSelected =
                    lesson.id === selectedLessonId &&
                    task.id === selectedTaskId;
                  const itemStyle = isLocked
                    ? lessonItemStyleLocked
                    : isLessonSelected
                    ? lessonItemStyleSelected
                    : lessonItemStyleBase;
                  const textColor = isLocked
                    ? "#aaa"
                    : isLessonSelected
                    ? "#fff"
                    : "inherit";
                  return (
                    <Tooltip title={isLocked ? "هذه المهمة مقفلة حالياً" : ""}>
                      <List.Item
                        onClick={() =>
                          onLessonClick(task.id, lesson.id, isLocked)
                        }
                        style={itemStyle}
                      >
                        <List.Item.Meta
                          avatar={
                            <span
                              style={{ color: textColor, marginLeft: "8px" }}
                            >
                              {getLessonIcon(lesson.type)}
                            </span>
                          }
                          title={
                            <Text
                              style={{ color: textColor, whiteSpace: "normal" }}
                            >
                              {lesson.title || "درس بلا عنوان"}
                            </Text>
                          }
                        />
                        {isLessonSelected && !isLocked && (
                          <PlayCircleOutlined
                            style={{
                              color: "#fff",
                              fontSize: "16px",
                              marginRight: "8px",
                            }}
                          />
                        )}
                      </List.Item>
                    </Tooltip>
                  );
                }}
              />
            </Panel>
          );
        })}
      </Collapse>
    </Sider>
  );
};

// ========================================
// Content Viewer Component
// ========================================
interface LessonContentViewerProps {
  lesson: TaskLesson | undefined;
}
const LessonContentViewer: React.FC<LessonContentViewerProps> = ({
  lesson,
}) => {

  const viewerContainerStyle: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#f0f2f5",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    padding: "16px",
    marginBottom: "16px",
  };
  const iframeContainerStyle: React.CSSProperties = {
    position: "relative",
    paddingBottom: "56.25%",
    height: 0,
    overflow: "hidden",
    backgroundColor: "#000",
    width: "100%",
    borderRadius: "inherit",
  };
  const iframeStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "none",
  };
  const audioStyle: React.CSSProperties = {
    width: "80%",
    maxWidth: "600px",
    marginTop: "20px",
  };
  if (!lesson) {
    return (
      <div style={viewerContainerStyle}>
        <Empty description="الرجاء تحديد درس من القائمة لعرضه." />
      </div>
    );
  }
  const embedUrl = getEmbedUrl(lesson.url, lesson.type);
  const renderContent = () => {
    switch (lesson.type) {
      case "embedded":
      case "video":
        if (embedUrl && getYouTubeId(lesson.url))
          return (
            <div style={iframeContainerStyle}>
              <iframe
                key={lesson.id}
                style={iframeStyle}
                src={embedUrl}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          );
        return (
          <div style={viewerContainerStyle}>
            {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
<video
              controls
              key={lesson.id}
              style={{
                maxWidth: "100%",
                maxHeight: "calc(100% - 40px)",
                borderRadius: "inherit",
              }}
            >
              <source src={lesson.url} />
              متصفحك لا يدعم الفيديو.
            </video>
          </div>
        );
      case "pdf":
        return (
          <div style={iframeContainerStyle}>
            <iframe
              key={lesson.id}
              style={iframeStyle}
              src={lesson.url}
              title={lesson.title}
              allowFullScreen={true}
               height="100%" 
            >
              <Paragraph style={{ padding: "20px" }}>
                {" "}
                لا يمكن عرض ملف PDF.
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  href={lesson.url}
                  target="_blank"
                  download
                >
                  تحميل
                </Button>
              </Paragraph>
            </iframe>
          </div>
        );
      case "audio":
        return (
          <div style={viewerContainerStyle}>
            <Title level={4}>{lesson.title}</Title>
            {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
<audio controls key={lesson.id} style={audioStyle} src={lesson.url}>
              متصفحك لا يدعم الصوت.
            </audio>
          </div>
        );
      case "docx":
        return (
          <div style={viewerContainerStyle}>
            <Alert
              type="info"
              showIcon
              message={`ملف وورد: ${lesson.title}`}
              description={
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  href={lesson.url}
                  target="_blank"
                  download
                >
                  تحميل المستند
                </Button>
              }
            />
          </div>
        );
      default:
        return (
          <div style={viewerContainerStyle}>
            <Alert
              type="warning"
              showIcon
              message={`ملف: ${lesson.title}`}
              description={
                <>
                  نوع الملف ({lesson.type}) غير مدعوم للعرض.
                  <br />
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    href={lesson.url}
                    target="_blank"
                    download
                  >
                    تحميل الملف
                  </Button>
                </>
              }
            />
          </div>
        );
    }
  };
  const viewerWrapperStyle: React.CSSProperties = {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    width: "100%",
  };
  return <div style={viewerWrapperStyle}>{renderContent()}</div>;
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
      {" "}
      <Space wrap>
        {" "}
        <Button
          icon={<DownloadOutlined />}
          href={downloadUrl}
          target="_blank"
          download
          disabled={!downloadUrl || isCurrentTaskLocked}
        >
          {" "}
          تحميل المرفق{" "}
        </Button>{" "}
      </Space>{" "}
      <Tooltip title={isCurrentTaskLocked ? "لا يمكنك إكمال مهمة مقفلة" : ""}>
        {" "}
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={onMarkComplete}
          loading={isLoadingComplete}
          disabled={isLoadingComplete || !selectedTask || isCurrentTaskLocked}
        >
          {" "}
          {isLoadingComplete
            ? "جاري..."
            : hasMoreContent
            ? "إكمال والمتابعة"
            : "إنهاء المهمة الأخيرة"}{" "}
        </Button>{" "}
      </Tooltip>{" "}
    </div>
  );
};

// ========================================
// Breadcrumb Component
// ========================================
interface SubscriptionBreadcrumbProps {
  subscription: Subscription | null;
  selectedTask: LevelTask | undefined;
  selectedLesson: TaskLesson | undefined;
}
const SubscriptionBreadcrumb: React.FC<SubscriptionBreadcrumbProps> = ({
  subscription,
  selectedTask,
  selectedLesson,
}) => {
  const lvl = getCurrentOrNextLevel(subscription!)
  /* ... same code ... */
  return (
    <Breadcrumb separator="›" style={{ marginBottom: "5px" }}>
      {" "}
      <Breadcrumb.Item href="#">
        {" "}
        <BookOutlined />{" "}
        <span style={{ marginRight: "4px" }}>
          {subscription?.program?.name || "..."}
        </span>{" "}
      </Breadcrumb.Item>{" "}
      <Breadcrumb.Item href="#">
        {" "}
        <ReadOutlined />{" "}
        <span style={{ marginRight: "4px" }}>
          {lvl?.name || "..."}
        </span>{" "}
      </Breadcrumb.Item>{" "}
      {selectedTask && (
        <Breadcrumb.Item>
          {" "}
          <CalendarOutlined />{" "}
          <span style={{ marginRight: "4px" }}>
            مهمة {formatDateLocale(selectedTask.date)}
          </span>{" "}
        </Breadcrumb.Item>
      )}{" "}
      {selectedLesson && (
        <Breadcrumb.Item>
          {" "}
          {getLessonIcon(selectedLesson.type)}{" "}
          <span style={{ marginRight: "4px" }}>{selectedLesson.title}</span>{" "}
        </Breadcrumb.Item>
      )}{" "}
    </Breadcrumb>
  );
};

// ========================================
// Main Page Component
// ========================================
const SubscriptionTaskViewerPage: React.FC = () => {
  const [playlistVisible, setPlaylistVisible] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [activeCollapseKey, setActiveCollapseKey] = useState<
    string | string[] | undefined
  >(undefined);

	const { id } = useParams(); 
  const {data, isLoading, error} = useQuery({queryKey: [id], queryFn: () => api.get({id:id}), refetchOnWindowFocus:false});
  
  const subscription = data?.items[0]

  // Sort tasks
  const lvl = getCurrentOrNextLevel(subscription!)
  const sortedTasks = useMemo(() => {
    if (!lvl?.tasks) return [];
    return [...lvl.tasks].sort((a, b) => {
      try {
        return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
      } catch (e) {
        return 0;
      }
    });
  }, [lvl?.tasks  ]);

  // Set initial selection
  useEffect(() => {
    if (sortedTasks.length > 0 && !selectedTaskId && !isLoading) {
      const firstUnlockedTask = sortedTasks.find(
        (task) => !isTaskLocked(task.date)
      );
      const taskToSelect = firstUnlockedTask || sortedTasks.find((t) => t);
      /* Fallback to absolutely first */ if (taskToSelect) {
        const firstLesson = taskToSelect.lessons?.[0];
        setSelectedTaskId(taskToSelect.id);
        setActiveCollapseKey(taskToSelect.id);
        if (firstLesson) setSelectedLessonId(firstLesson.id);
      }
    }
  }, [sortedTasks, selectedTaskId, isLoading]);

  // Derive selected items
  const selectedTask = useMemo(
    () => sortedTasks.find((task) => task?.id === selectedTaskId),
    [selectedTaskId, sortedTasks]
  );
  const selectedLesson = useMemo(
    () =>
      selectedTask?.lessons?.find((lesson) => lesson?.id === selectedLessonId),
    [selectedTask, selectedLessonId]
  );
  const isCurrentTaskLocked = useMemo(
    () => (selectedTask ? isTaskLocked(selectedTask.date) : true),
    [selectedTask]
  );
  const hasMoreContent = useMemo(() => {
    if (!selectedTaskId || !selectedTask || isCurrentTaskLocked) return false;
    if (findNextLessonInTask(selectedTask, selectedLessonId)) return true;
    if (findNextUnlockedTask(sortedTasks, selectedTaskId)) return true;
    return false;
  }, [
    selectedTask,
    selectedLessonId,
    sortedTasks,
    selectedTaskId,
    isCurrentTaskLocked,
  ]);

  // Handlers
  const togglePlaylist = () => setPlaylistVisible(!playlistVisible);

  const handleLessonClick = (
    taskId: string,
    lessonId: string,
    isLocked: boolean
  ) => {
    if (isLocked) {
      toast.warning("هذه المهمة مقفلة حالياً.");
      return;
    }
    setSelectedTaskId(taskId);
    setSelectedLessonId(lessonId);
    if (activeCollapseKey !== taskId) setActiveCollapseKey(taskId);
  };

  const handleCollapseChange = (key: string | string[]) => {
    const newActiveKey =
      typeof key === "string" ? key : Array.isArray(key) ? key[0] : undefined;
    setActiveCollapseKey(newActiveKey);
    if (newActiveKey) {
      const task = sortedTasks.find((t) => t?.id === newActiveKey);
      if (task && !isTaskLocked(task.date)) {
        if (selectedTaskId !== newActiveKey) {
          setSelectedTaskId(newActiveKey);
          setSelectedLessonId(task.lessons?.[0]?.id || null);
        }
      }
    }
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
    if (
      !selectedTaskId ||
      !selectedLessonId ||
      isLoadingComplete ||
      isCurrentTaskLocked
    )
      return;
    // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
    const promise = new Promise<string>(async (resolve, reject) => {
      setIsLoadingComplete(true);
      await new Promise((res) => setTimeout(res, 1500));
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
          return `أكملت مهمة ${formatDateLocale(
            selectedTask?.date || ""
          )}. التالي.`;
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
  const mainLayoutStyle: React.CSSProperties = { minHeight: "100vh" };
  const contentLayoutStyle: React.CSSProperties = {};
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
        <Layout style={contentLayoutStyle}>
          <Content style={contentStyle}>
            {isLoading && (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="large" tip="جاري تحميل..." />
              </div>
            )}
            {error && !isLoading && (
              <Alert
                message="خطأ في تحميل البيانات"
                description={error.message}
                type="error"
                showIcon
                style={{ marginBottom: "24px" }}
              />
            )}
            {!isLoading && !error && subscription && (
              <>
                <div style={topBarStyle}>
                  {" "}
                  <SubscriptionBreadcrumb
                    subscription={subscription}
                    selectedTask={selectedTask}
                    selectedLesson={selectedLesson}
                  />{" "}
                  {!playlistVisible && (
                    <Button
                      icon={<UnorderedListOutlined />}
                      onClick={togglePlaylist}
                      aria-label="عرض قائمة المهام"
                    >
                      {" "}
                      عرض القائمة{" "}
                    </Button>
                  )}{" "}
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
            {!isLoading && !error && !subscription && (
              <Empty description="لم يتم العثور على بيانات الاشتراك." />
            )}
          </Content>
        </Layout>
        {!isLoading && !error && subscription && (
          <SubscriptionTaskPlaylist
            levelTasks={sortedTasks}
            selectedTaskId={selectedTaskId}
            selectedLessonId={selectedLessonId}
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
