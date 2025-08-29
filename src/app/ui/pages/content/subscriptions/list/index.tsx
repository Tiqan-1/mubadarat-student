import type React from "react";
import { useMemo } from "react";
import api, { getCurrentOrNextLevel, type EnhancedTask, type Subscription, type TaskLesson } from "@/app/api/services/subscriptions";
import {
  Layout,
  Typography,
  Timeline,
  Card,
  List,
  Tag,
  Spin,
  Empty, 
  Collapse,
  Alert,
  Space,
  Tabs,
  Button,
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
  TeamOutlined,
  AppstoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

dayjs.locale("ar");
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// --- Type Definitions ---
interface GroupedTasksByDate {
  [dateKey: string]: EnhancedTask[];
}
interface GroupedLevelTasks {
  [dateKey: string]: EnhancedTask[];
} // For subscription view

const { Content } = Layout;
const { Title, Text, Paragraph, Link } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;
 

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
const getLessonTagColor = (type: TaskLesson["type"]): string => {
  switch (type) {
    case "video":
      return "red";
    case "pdf":
      return "blue";
    case "audio":
      return "purple";
    case "docx":
      return "cyan";
    case "embedded":
      return "orange";
    default:
      return "default";
  }
};
const formatDateLocale = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

 
const handleNavigateToSubscription = (subscriptionId: string) => {
  // toast.info(`Navigating to subscription: ${subscriptionId}`);
  window.location.href = `#subscriptions/${subscriptionId}`;
};

// --- View Component Styles ---
const taskCardStyle: React.CSSProperties = { marginBottom: "12px" };
const taskContextStyle: React.CSSProperties = {
  marginBottom: "10px",
  paddingBottom: "8px",
  borderBottom: "1px dashed #f0f0f0",
  fontSize: "0.85em",
  lineHeight: 1.4,
};
const dateHeaderStyle: React.CSSProperties = {
  fontWeight: 500,
  marginBottom: "8px",
  color: "#555",
};
 

// ========================================
// Subscription-Grouped View Component
// ========================================
interface SubscriptionTimetableViewProps {
  subscriptions: Subscription[];
}
const SubscriptionTimetableView: React.FC<SubscriptionTimetableViewProps> = ({
  subscriptions,
}) => {
  const subscriptionCardStyle: React.CSSProperties = { marginBottom: "32px" };
  const timelineItemStyle: React.CSSProperties = { paddingBottom: "15px" };

  const groupLevelTasksByDate = (tasks: EnhancedTask[]): GroupedLevelTasks => {
    return tasks.reduce((acc, task) => {
      const dateKey = task.date.split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
      return acc;
    }, {} as GroupedLevelTasks);
  };


 
  return (
    <div>
      {subscriptions.map((sub) => {
        const lvl = getCurrentOrNextLevel(sub)
        const levelTasks = lvl?.tasks || [];
        const groupedAndSortedTasks = useMemo(() => {
          if (levelTasks.length === 0) return [];
          const flatEnhancedTasks =   levelTasks.map<EnhancedTask>((task) => ({
                ...task,
                programId: sub.program.id,
                programName: sub.program.name || "N/A",
                levelName: lvl?.name || "N/A",
                subscriptionId: sub?.id || "",
            }))
          const sortedTasks = [...flatEnhancedTasks].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          const grouped = groupLevelTasksByDate(sortedTasks);
          const sortedDates = Object.keys(grouped);
          return sortedDates.map((date) => ({ date, tasks: grouped[date] }));
        }, [sub, levelTasks, lvl]);

        return (
          <Card
            key={sub.id}
            title={
              <Space>
                <BookOutlined /> {sub.program?.name || "N/A"}
              </Space>
            }
            extra={<>
            
            <Button
                type="link"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleNavigateToSubscription(sub.id)} 
                style={{
                  float: "left",
                  padding: "0 5px",
                  fontSize: "0.85em",
                }}
              >
                عرض التفاصيل
              </Button>
            <Tag color="green">نشط</Tag>
            </>}
            style={subscriptionCardStyle}
            headStyle={{ backgroundColor: "#fafafa" }}
          >
            <Title level={5} style={{ marginBottom: "20px" }}>
              <ReadOutlined style={{ marginLeft: "8px" }} />{" "}
              {lvl?.name || "N/A"}
            </Title>
            {levelTasks.length === 0 && (
              <Empty
                description="لا توجد مهام مجدولة لهذا المستوى."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
            {levelTasks.length > 0 && (
              <Timeline mode="left">
                {groupedAndSortedTasks.map(({ date, tasks }) => (
                  <Timeline.Item
                    key={`${sub.id}-${date}`}
                    label={
                      <Text style={dateHeaderStyle}>
                        {formatDateLocale(date)}
                      </Text>
                    }
                    dot={<CalendarOutlined style={{ fontSize: "16px" }} />}
                    style={timelineItemStyle}
                  >
                    {tasks.map((task) => (
                      <Card
                        key={task.id}
                        size="small"
                        bordered={false}
                        style={taskCardStyle}
                        bodyStyle={{ padding: "12px" }}
                      >
                        {task.note && <Paragraph>{task.note}</Paragraph>}
                        {!task.note && task.lessons.length === 0 && (
                          <Text type="secondary">لا توجد تفاصيل.</Text>
                        )}
                        
                        {task.lessons && task.lessons.length > 0 && (
                          <Collapse
                            ghost
                            expandIconPosition="right"
                            size="small"
                          >
                            <Panel
                              key={`panel-task-${task.id}`}
                              header={
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "0.9em" }}
                                >
                                  <UnorderedListOutlined
                                    style={{ marginLeft: "8px" }}
                                  />{" "}
                                  عرض الدروس ({task.lessons.length})
                                </Text>
                              }
                            >
                              <List
                                size="small"
                                dataSource={task.lessons}
                                renderItem={(lesson: TaskLesson) => (
                                  <List.Item
                                    key={lesson.id}
                                    style={{ padding: "6px 0" }}
                                  >
                                    {" "}
                                    <List.Item.Meta
                                      avatar={getLessonIcon(lesson.type)}
                                      title={
                                        <Link
                                          href={lesson.url || "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          disabled={!lesson.url}
                                        >
                                          {lesson.title}
                                        </Link>
                                      }
                                    />{" "}
                                    <Tag color={getLessonTagColor(lesson.type)}>
                                      {lesson.type}
                                    </Tag>{" "}
                                  </List.Item>
                                )}
                              />
                            </Panel>
                          </Collapse>
                        )}
                        <div style={{ clear: "both" }} />
                      </Card>
                    ))}
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Card>
        );
      })}
    </div>
  );
};

// ========================================
// Unified Timeline View Component
// ========================================
interface UnifiedTimetableViewProps {
  groupedAndSortedTasks: { date: string; tasks: EnhancedTask[] }[];
}
const UnifiedTimetableView: React.FC<UnifiedTimetableViewProps> = ({
  groupedAndSortedTasks,
}) => {
  const timelineItemStyle: React.CSSProperties = { paddingBottom: "15px" };

  return (
    <div>
      {groupedAndSortedTasks.length === 0 && (
        <Empty description="لا توجد مهام مجدولة في اشتراكاتك." />
      )}
      {groupedAndSortedTasks.length > 0 && (
        <Timeline mode="left">
          {groupedAndSortedTasks.map(({ date, tasks }) => (
            <Timeline.Item
              key={date}
              label={
                <Text style={dateHeaderStyle}>{formatDateLocale(date)}</Text>
              }
              dot={<CalendarOutlined style={{ fontSize: "16px" }} />}
              style={timelineItemStyle}
            >
              {tasks.map((task: EnhancedTask) => (
                <Card
                  key={task.id}
                  size="small"
                  bordered={false}
                  style={taskCardStyle}
                  bodyStyle={{ padding: "12px" }}
                >
                  <div style={taskContextStyle}>
                    <Text type="secondary">
                      {" "}
                      <BookOutlined style={{ marginLeft: "5px" }} />{" "}
                      {task.programName}{" "}
                    </Text>
                    <Text type="secondary" style={{ marginRight: "10px" }}>
                      {" "}
                      <ReadOutlined style={{ marginLeft: "5px" }} />{" "}
                      {task.levelName}{" "}
                    </Text>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    size="small"
                      onClick={() => handleNavigateToSubscription(task.subscriptionId)}
                    style={{
                      float: "left",
                      padding: "0 5px",
                      fontSize: "0.85em",
                    }}
                  >
                    عرض التفاصيل
                  </Button>
                  </div>
                  {task.note && <Paragraph>{task.note}</Paragraph>}
                  {!task.note && task.lessons.length === 0 && (
                    <Text type="secondary" style={{ display: "block" }}>
                      لا توجد تفاصيل إضافية.
                    </Text>
                  )} 
                  {/* ----------------------------- */}
                  {task.lessons && task.lessons.length > 0 && (
                    <Collapse ghost expandIconPosition="right" size="small">
                      <Panel
                        key={`panel-task-${task.id}`}
                        header={
                          <Text type="secondary" style={{ fontSize: "0.9em" }}>
                            <UnorderedListOutlined
                              style={{ marginLeft: "8px" }}
                            />{" "}
                            عرض الدروس ({task.lessons.length})
                          </Text>
                        }
                      >
                        <List
                          size="small"
                          dataSource={task.lessons}
                          renderItem={(lesson: TaskLesson) => (
                            <List.Item
                              key={lesson.id}
                              style={{ padding: "6px 0" }}
                            >
                              {" "}
                              <List.Item.Meta
                                avatar={getLessonIcon(lesson.type)}
                                title={
                                  <Link
                                    href={lesson.url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    disabled={!lesson.url}
                                  >
                                    {lesson.title}
                                  </Link>
                                }
                              />{" "}
                              <Tag color={getLessonTagColor(lesson.type)}>
                                {lesson.type}
                              </Tag>{" "}
                            </List.Item>
                          )}
                        />
                      </Panel>
                    </Collapse>
                  )}
                  <div style={{ clear: "both" }} />
                </Card>
              ))}
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </div>
  );
};

// ========================================
// Main Combined Page Component
// ========================================
const CombinedTimetablePage: React.FC = () => { 
  const {data, error, isLoading} = useQuery({queryKey: ['subscriptions'], queryFn: () => api.get({}), refetchOnWindowFocus:false}); 
 
    if(error) { 
    toast.error("فشل تحميل بيانات الاشتراكات.");
  }

  // --- Centralized Data Processing ---
  // Flatten tasks
  const flatEnhancedTasks = useMemo((): EnhancedTask[] => {
    if (!data?.items || data?.items.length === 0) return [];
    return data?.items.flatMap((sub) => {
      const lvl = getCurrentOrNextLevel(sub)
      return (lvl?.tasks || []).map((task) => ({
        ...task,
        programId: sub.program.id,
        programName: sub.program.name || "N/A",
        levelName: lvl?.name || "N/A",
        subscriptionId: sub?.id || "",
      }))
    }
    );
  }, [data?.items]);

  // Group flat tasks by date (for Calendar and Unified view)
  const tasksGroupedByDate = useMemo((): GroupedTasksByDate => {
    return flatEnhancedTasks.reduce((acc, task) => {
      try {
        const dateKey = dayjs(task.date).format("YYYY-MM-DD");
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(task);
      } catch (e) {
        console.error("Err group:", task, e);
      }
      return acc;
    }, {} as GroupedTasksByDate);
  }, [flatEnhancedTasks]);

  // Create sorted data structure for Unified Timeline View
  const unifiedTimelineData = useMemo(() => {
    const sortedDates = Object.keys(tasksGroupedByDate).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    return sortedDates.map((date) => ({
      date,
      tasks: tasksGroupedByDate[date].sort((a, b) =>
        a.programName.localeCompare(b.programName)
      ),
    }));
  }, [tasksGroupedByDate]);

  // Style
  const contentStyle: React.CSSProperties = { padding: "24px 48px" };

  return ( 
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={contentStyle}>
          <Title level={2} style={{ marginBottom: "24px", textAlign: "right" }}>
          إشتراكاتي
          </Title>

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

          {!isLoading && !error && data?.items.length === 0 && (
            <Empty description="أنت غير مشترك في أي برامج نشطة حالياً." />
          )}

          {!isLoading && !error && (data?.items.length ?? 0) > 0 && (
            <Tabs defaultActiveKey="unified" type="card"> 
                <TabPane
                  tab={
                    <span>
                      <TeamOutlined /> العرض حسب التاريخ
                    </span>
                  }
                  key="unified"
                >
                  <UnifiedTimetableView
                    groupedAndSortedTasks={unifiedTimelineData}
                  />
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      <AppstoreOutlined /> عرض حسب الاشتراك
                    </span>
                  }
                  key="subscription"
                >
                  <SubscriptionTimetableView subscriptions={data?.items ?? []} />
                </TabPane>
            </Tabs>
          )}
        </Content>
      </Layout> 
  );
};

export default CombinedTimetablePage; 