import type React from "react"; 
import {
  List,
  Collapse,
  Space,
  Button,
  Tooltip,
  Typography,
  Layout,
  Menu,
  Dropdown
} from "antd";
import { 
  PlayCircleOutlined,
  LockOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  AudioOutlined,
  FileWordOutlined,
  LinkOutlined,
  LeftOutlined,
  DownOutlined,
  CheckCircleFilled,
} from "@ant-design/icons"; 
import "dayjs/locale/ar";
import type { LevelTask, ProgramLevel, TaskLesson } from "@/app/api/services/subscriptions"; 
import dayjs from "dayjs";

const { Sider } = Layout;
const { Text } = Typography;
const { Panel } = Collapse;


export const getLessonIcon = (type: TaskLesson["type"]): React.ReactNode => {
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
export const formatDateLocale = (dateString: string | undefined | null): string => {
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
export  const isTaskLocked = (taskDate: string | undefined | null): boolean => {
  if (!taskDate) return true;
  try {
    const taskDay = dayjs(taskDate);
    if (!taskDay.isValid()) return true;
    return taskDay.isAfter(dayjs(), "day");
  } catch (e) {
    return true;
  }
};
interface SubscriptionTaskPlaylistProps {
  levelTasks: LevelTask[];
  selectedTaskId: string | null;
  selectedLessonId: string | null;
  completedLessons: Set<string>;
  visible: boolean;
  activeCollapseKey: string | string[] | undefined;
  onLessonClick: (taskId: string, lessonId: string, isLocked: boolean) => void;
  onCollapseChange: (key: string | string[]) => void;
  onClose: () => void;
  allLevels: ProgramLevel[]; // <-- New: All available levels for the dropdown
  selectedLevelId: string | null; // <-- New: The ID of the currently active level
  onLevelChange: (levelId: string) => void; // <-- New: Handler for changing the level
}
export const SubscriptionTaskPlaylist: React.FC<SubscriptionTaskPlaylistProps> = ({
  levelTasks,
  selectedTaskId,
  selectedLessonId,
  completedLessons,
  visible,
  activeCollapseKey,
  onLessonClick,
  onCollapseChange,
  onClose,
  allLevels,
  selectedLevelId,
  onLevelChange,
}) => {

  const selectedLevel = allLevels.find(l => l.id === selectedLevelId);

  const levelMenu = (
    <Menu onClick={({ key }) => onLevelChange(key)}>
      {allLevels.map(level => (
        <Menu.Item key={level.id}>{level.name}</Menu.Item>
      ))}
    </Menu>
  );


  const siderStyle: React.CSSProperties = {
    // background: "#f0f2f5",
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
        <Dropdown overlay={levelMenu} trigger={['click']}>
          <Button>
            {selectedLevel?.name || "اختر المستوى"} <DownOutlined />
          </Button>
        </Dropdown>
        <Button
          icon={<LeftOutlined />}
          onClick={onClose}
          type="text"
          aria-label="إخفاء القائمة"
        />
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
          const isCompletedTask = task.lessons.map(x => x.id).every(id => completedLessons.has(id));
          const formattedDate = formatDateLocale(task.date); // Get formatted date or fallback
          // --------------------------------------------------------------------------

          const headerStyle = isLocked
            ? panelHeaderStyleLocked
            : task.id === selectedTaskId
            ? panelHeaderStyleActive
            : panelHeaderStyleBase;

          return (
            <Panel
              key={task.id} 
              collapsible={isLocked ? "disabled" : undefined}
              header={
                <div style={headerStyle}>
                  <Space direction="vertical" size={0}>
                    <Text style={{ color: "inherit" }}>
                      
                      {taskIndex + 1}. {formattedDate}
                    </Text>
                    {task.note && (
                      <Text type="secondary" style={{ fontSize: "0.85em" }}>
                        {task.note}
                      </Text>
                    )}
                  </Space>
                  {isCompletedTask && <CheckCircleFilled style={{ fontSize: "14px" }} />}
                  {isLocked && <LockOutlined style={{ fontSize: "14px" }} />}
                </div>
              }
            >
              <List
                size="small"
                dataSource={task.lessons || []}
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
                  const isCompleted = completedLessons.has(lesson.id);
                  const isLessonSelected = lesson.id === selectedLessonId && task.id === selectedTaskId;
                  const itemStyle = isLocked ? lessonItemStyleLocked : isLessonSelected ? lessonItemStyleSelected : lessonItemStyleBase;
                  const textColor = isLocked ? "#aaa" : isLessonSelected ? "#fff" : "inherit";

                  return (
                    <Tooltip title={isLocked ? "هذه المهمة مقفلة حالياً" : ""}>
                      <List.Item onClick={() => onLessonClick(task.id, lesson.id, isLocked)} style={itemStyle}>
                        <List.Item.Meta
                          avatar={
                            <Space>
                              {isCompleted ? (
                                <CheckCircleFilled style={{ color: isLessonSelected ? '#fff' : '#52c41a' }} />
                              ) : (
                                <span style={{ color: textColor, marginLeft: "8px" }}>
                                  {getLessonIcon(lesson.type)}
                                </span>
                              )}
                            </Space>
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