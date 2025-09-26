import type React from "react";

import { Empty, Alert, Button, Card, Typography, Tooltip } from "antd";
import {
  DownloadOutlined,
  FormOutlined
} from "@ant-design/icons"; 
import "dayjs/locale/ar";
import { getAssignmentUrl, type PlaylistItem, type TaskLesson } from "@/app/api/services/subscriptions";
import { isAssignmentExpired } from "./SubscriptionTaskPlaylist";
import dayjs from "dayjs";

const { Title, Paragraph, Text } = Typography;

function getEmbedUrl(
  lessonUrl: string,
  lessonType: TaskLesson["type"]
): string | null {
  if (!lessonUrl) return null;
  if (lessonType === "embedded" || lessonType === "video") {
    const youtubeId = getYouTubeId(lessonUrl);
    if (youtubeId)
      return `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1&cc_load_policy=1&hl=ar&enablejsapi=1`;
  }
  if (lessonType === "pdf") return lessonUrl;
  return null;
}

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


interface LessonContentViewerProps {
  item: PlaylistItem  | undefined;
}
export  const LessonContentViewer: React.FC<LessonContentViewerProps> = ({
  item,
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
  if (!item) {
    return (
      <div style={viewerContainerStyle}>
        <Empty description="الرجاء تحديد درس أو واجب من القائمة لعرضه." />
      </div>
    );
  }
  
    if (item.itemType === 'assignment') {
      const isExpired = isAssignmentExpired(item.availableUntil);
      const assignmentTypeLabel = item.type === 'exam' ? 'الاختبار' : 'الواجب';

      return (
        <div style={viewerContainerStyle}>
          <Card style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
            <Title level={3}>
              <FormOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              {assignmentTypeLabel}: {item.title}
            </Title>
            <Paragraph>
              <Text>آخر موعد للتسليم: </Text>
              <Tooltip title={dayjs(item.availableUntil).format('dddd, D MMMM YYYY, h:mm a')}>
                <Text type={isExpired ? 'danger' : 'secondary'}>
                  {dayjs(item.availableUntil).fromNow()}
                </Text>
              </Tooltip>
              {isExpired && <Text type="danger"> (انتهى الوقت)</Text>}
            </Paragraph>
            <Tooltip title={isExpired ? 'لقد انتهى الموعد المحدد لهذا الواجب' : ''}>
              {/* The antd Button needs a wrapper for the tooltip to work when disabled */}
              <span>
                <Button
                  type="primary"
                  size="large"
                  href={getAssignmentUrl(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  disabled={isExpired}
                  icon={<FormOutlined />}
                >
                  الانتقال إلى {assignmentTypeLabel}
                </Button>
              </span>
            </Tooltip>
          </Card>
        </div>
      );
    }

  const embedUrl = getEmbedUrl(item.url, item.type);
  const renderContent = () => {
    switch (item.type) {
      case "embedded":
      case "video":
        if (embedUrl && getYouTubeId(item.url))
          return (
            <div style={iframeContainerStyle}>
              <iframe
                key={item.id}
                style={iframeStyle}
                src={embedUrl}
                title={item.title}
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
              key={item.id}
              style={{
                maxWidth: "100%",
                maxHeight: "calc(100% - 40px)",
                borderRadius: "inherit",
              }}
            >
              <source src={item.url} />
              متصفحك لا يدعم الفيديو.
            </video>
          </div>
        );
      case "pdf":
        return (
          <div style={iframeContainerStyle}>
            <iframe
              key={item.id}
              style={iframeStyle}
              src={item.url}
              title={item.title}
              allowFullScreen={true}
               height="100%" 
            >
              <Paragraph style={{ padding: "20px" }}>
                {" "}
                لا يمكن عرض ملف PDF.
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  href={item.url}
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
            <Title level={4}>{item.title}</Title>
            {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
<audio controls key={item.id} style={audioStyle} src={item.url}>
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
              message={`ملف وورد: ${item.title}`}
              description={
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  href={item.url}
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
              message={`ملف: ${item.title}`}
              description={
                <>
                  نوع الملف ({item.type}) غير مدعوم للعرض.
                  <br />
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    href={item.url}
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