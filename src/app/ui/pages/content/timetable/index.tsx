import type React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import api, { type EnhancedTask, type TaskLesson } from "@/app/api/services/subscriptions";
import {
  Layout,
  Typography,
  Card,
  List,
  Tag,
  Spin,
  Empty,
  Collapse,
  Alert,
  Calendar,
  Badge,
  Button,
  type CalendarProps,
} from "antd";
import {
  VideoCameraOutlined,
  FilePdfOutlined,
  AudioOutlined,
  FileWordOutlined,
  LinkOutlined,
  UnorderedListOutlined,
  ReadOutlined,
  BookOutlined,
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

const { Content } = Layout;
const { Title, Text, Paragraph, Link } = Typography;
const { Panel } = Collapse; 
 

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
 
const handleNavigateToSubscription = (subscriptionId: string) => {
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

// ========================================
// Calendar View Component
// ========================================
interface CalendarTimetableViewProps {
  tasksGroupedByDate: GroupedTasksByDate;
  initialDate?: dayjs.Dayjs;
}
const CalendarTimetableView: React.FC<CalendarTimetableViewProps> = ({
  tasksGroupedByDate,
  initialDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(
    initialDate || dayjs()
  );
  const selectedTasksRef = useRef<HTMLDivElement>(null);

  // Filter tasks for the currently selected date
  const tasksForSelectedDate = useMemo((): EnhancedTask[] => {
    const dateKey = selectedDate.format("YYYY-MM-DD");
    const tasks = tasksGroupedByDate[dateKey] || [];
    return tasks.sort((a, b) => a.programName.localeCompare(b.programName));
  }, [selectedDate, tasksGroupedByDate]);

  // Calendar Cell Rendering
  const dateCellRender = (value: dayjs.Dayjs) => {
    const dateKey = value.format("YYYY-MM-DD");
    const listData = tasksGroupedByDate[dateKey] || [];
    if (listData.length === 0) return null;
    return (
      <ul
        className="events"
        style={{
          listStyle: "none",
          margin: 0,
          padding: "0 2px",
          fontSize: "0.75em",
          lineHeight: 1.3,
        }}
      >
        {" "}
        {listData.slice(0, 2).map((item) => (
          <li
            key={item.id}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {" "}
            <Badge
              status="processing"
              color={getLessonTagColor(item.lessons?.[0]?.type || "default")}
            />{" "}
            <span style={{ marginRight: "3px" }}>
              {item.programName.substring(0, 20)}
            </span>{" "}
          </li>
        ))}{" "}
        {listData.length > 2 && (
          <li style={{ textAlign: "center" }}>
            <Text type="secondary">...</Text>
          </li>
        )}{" "}
      </ul>
    );
  };

  // Date Selection Handler
  const onSelectDate = (value: dayjs.Dayjs) => {
    setSelectedDate(value);
  };
  const onPanelChange = (value: dayjs.Dayjs) => {
    console.log(value)
    /* Handle panel change if needed */
  };

  // Effect for Scrolling
  useEffect(() => {
    if (selectedDate && selectedTasksRef.current) {
      const timer = setTimeout(() => {
        selectedTasksRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedDate]);

  // Styles
  const calendarCardStyle: React.CSSProperties = { marginBottom: "24px" };
  const selectedDateHeaderStyle: React.CSSProperties = {
    marginTop: "16px",
    marginBottom: "16px",
    borderBottom: "1px solid #f0f0f0",
    paddingBottom: "10px",
  };

  const cellRender: CalendarProps<dayjs.Dayjs>['cellRender'] = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    if (info.type === 'month') return dateCellRender(current);
    return info.originNode;
  };
  return (
    <div>
      <Card bordered={false} style={calendarCardStyle}>
        <Calendar
          cellRender={cellRender} 
          onSelect={onSelectDate}
          onPanelChange={onPanelChange}
          value={selectedDate}
        />
      </Card>
      <div ref={selectedTasksRef}>
        <Title level={4} style={selectedDateHeaderStyle}>
          {" "}
          المهام ليوم: {selectedDate.format("dddd, D MMMM YYYY")}{" "}
        </Title>
        {tasksForSelectedDate.length === 0 && (
          <Empty
            description={"لا توجد مهام مجدولة لهذا اليوم."}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
        {tasksForSelectedDate.map((task: EnhancedTask) => (
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
                <ReadOutlined style={{ marginLeft: "5px" }} /> {task.levelName}{" "}
              </Text>
              <Button
                  type="link"
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => handleNavigateToSubscription(task.subscriptionId)}
                  style={{ float: "left", padding: "0 5px", fontSize: "0.85em" }}
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
                      <UnorderedListOutlined style={{ marginLeft: "8px" }} />{" "}
                      عرض الدروس ({task.lessons.length})
                    </Text>
                  }
                >
                  <List
                    size="small"
                    dataSource={task.lessons}
                    renderItem={(lesson: TaskLesson) => (
                      <List.Item key={lesson.id} style={{ padding: "6px 0" }}>
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
      </div>
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
    return data?.items.flatMap((sub) =>
      sub.program.levels.flatMap((level) => (level?.tasks || []).map((task) => ({
          ...task,
          programId: sub.program.id,
          programName: sub.program.name || "N/A",
          levelName: level.name || "N/A",
          subscriptionId: sub?.id || "",
        })
      )
    )
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
 
  // Style
  const contentStyle: React.CSSProperties = { padding: "24px 48px" };

  return ( 
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={contentStyle}>
          <Title level={2} style={{ marginBottom: "24px", textAlign: "right" }}>
            الجدول الزمني
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
                <CalendarTimetableView
                  tasksGroupedByDate={tasksGroupedByDate}
                />
          )}
        </Content>
      </Layout> 
  );
};

export default CombinedTimetablePage;