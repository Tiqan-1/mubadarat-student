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
  FormOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons"; 
import "dayjs/locale/ar";
import { getTaskItems, type LevelTask, type PlaylistItem, type ProgramLevel } from "@/app/api/services/subscriptions"; 
import dayjs from "dayjs"; 

const { Sider } = Layout;
const { Text } = Typography;
const { Panel } = Collapse;


export const getPlaylistItemIcon = (item: PlaylistItem): React.ReactNode => {
  switch (item.type) {
    case "video":
    case "embedded":
      return <VideoCameraOutlined />;
    case "pdf":
      return <FilePdfOutlined />;
    case "audio":
      return <AudioOutlined />;
    case "docx":
      return <FileWordOutlined />;
    // Assignment types
    case "exam":
    case "homework":
      return <FormOutlined />;
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
export const isAssignmentExpired = (availableUntil: string | undefined | null): boolean => {
  if (!availableUntil) return false;
  try {
    const deadline = dayjs(availableUntil);
    if (!deadline.isValid()) return true;
    return dayjs().isAfter(deadline);
  } catch (e) {
    return true;
  }
};

interface SubscriptionTaskPlaylistProps {
  levelTasks: LevelTask[];
  selectedTaskId: string | null;
  selectedItemId: string | null;
  completedItems: Set<string>;
  visible: boolean;
  activeCollapseKey: string | string[] | undefined;
  onItemClick: (taskId: string, itemId: string, isLocked: boolean) => void;
  onCollapseChange: (key: string | string[]) => void;
  onClose: () => void;
  allLevels: ProgramLevel[]; 
  selectedLevelId: string | null; 
  onLevelChange: (levelId: string) => void; 
}
export const SubscriptionTaskPlaylist: React.FC<SubscriptionTaskPlaylistProps> = ({
  levelTasks,
  selectedTaskId,
  selectedItemId,
  completedItems,
  visible,
  activeCollapseKey,
  onItemClick,
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
  const itemStyleBase: React.CSSProperties = {
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
  const itemStyleSelected: React.CSSProperties = {
    ...itemStyleBase,
    backgroundColor: "#1890ff",
    color: "#fff",
    fontWeight: 500,
  };
  const itemStyleLocked: React.CSSProperties = {
    ...itemStyleBase,
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
          if (!task || !task.id) {
            console.warn("Skipping rendering of invalid task object:", task);
            return null;
          }

          const playlistItems = getTaskItems(task);

          const isLocked = isTaskLocked(task.date);
          const isCompletedTask = task.lessons.map(x => x.id).every(id => completedItems.has(id));
          const formattedDate = formatDateLocale(task.date);

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
                dataSource={playlistItems}
                renderItem={(item) => {
                  const isCompleted = completedItems.has(item.id);
                  const isSelected = item.id === selectedItemId && task.id === selectedTaskId;
                  const isExpired = item.itemType === 'assignment' && isAssignmentExpired(item.availableUntil);
                  const isItemLocked = isLocked || isExpired;

                  const itemStyle = isItemLocked ? itemStyleLocked : isSelected ? itemStyleSelected : itemStyleBase;
                  const textColor = isItemLocked ? "#aaa" : isSelected ? "#fff" : "inherit";
                  
                  const itemTitle = item.itemType === 'assignment' 
                    ? `${item.type === 'exam' ? 'اختبار' : 'واجب'}: ${item.title}`
                    : item.title;

                  const tooltipTitle = isExpired ? 'انتهى وقت التسليم' : isLocked ? 'المهمة مقفلة حالياً' : '';

                  return (
                    <Tooltip title={tooltipTitle}>
                      <List.Item onClick={() => onItemClick(task.id, item.id, isItemLocked)} style={itemStyle}>
                        <List.Item.Meta
                          avatar={
                            <Space>
                              {isCompleted ? (
                                <CheckCircleFilled style={{ color: isSelected ? '#fff' : '#52c41a' }} />
                              ) : isExpired ? (
                                <ClockCircleOutlined style={{ color: textColor, marginLeft: "8px" }}/>
                              ) : (
                                <span style={{ color: textColor, marginLeft: "8px" }}>
                                  {getPlaylistItemIcon(item)}
                                </span>
                              )}
                            </Space>
                          }
                          title={<Text style={{ color: textColor }} delete={isExpired}>{itemTitle || "بدون عنوان"}</Text>}
                        />
                        {isSelected && !isItemLocked && <PlayCircleOutlined style={{ color: "#fff" }} />}
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