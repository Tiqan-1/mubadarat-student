import type React from "react";
import {
  Empty,
  Alert,
  Button,
} from "antd";
import {
  DownloadOutlined
} from "@ant-design/icons"; 
import "dayjs/locale/ar";
import type { TaskLesson } from "@/app/api/services/subscriptions";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";

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
  lesson: TaskLesson | undefined;
}
export  const LessonContentViewer: React.FC<LessonContentViewerProps> = ({
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