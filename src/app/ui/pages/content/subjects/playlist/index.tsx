// LecturePageSingleFile.tsx
import type React from 'react';
import { useState, useMemo, useEffect } from 'react';
import {
    Layout,
    Breadcrumb,
    Button,
    Space,
    Typography,
    List,
    ConfigProvider,
    Result, // Added Result
    message, // Added message
} from 'antd';
import {
    UnorderedListOutlined,
    DownloadOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    RightOutlined,
    HomeOutlined,
    ReadOutlined,
    VideoCameraOutlined,
    WarningOutlined, // Added WarningOutlined
} from '@ant-design/icons';
import arEG from 'antd/lib/locale/ar_EG';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import api, { type Lesson } from "@/app/api/services/subjects"; 

const { Content, Sider } = Layout;
const { Text, Title, Paragraph } = Typography; // Added Paragraph

// ========================================
// 1. Types Definition
// ======================================== 

export interface LecturePageProps {
    lessons: Lesson[];
    initialLessonId?: string;
}

// ========================================
// 2. Helper Utilities
// ========================================
/**
 * Tries to extract YouTube Video ID from various URL formats.
 */
export function getYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Creates the appropriate embed URL.
 */
export function getEmbedUrl(lessonUrl: string, lessonType: Lesson['type']): string | null {
    if (lessonType === 'embedded' || lessonType === 'video') {
        const youtubeId = getYouTubeId(lessonUrl);
        if (youtubeId) {
            return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&hl=ar&enablejsapi=1`;
        }
    }
    if (lessonType === 'pdf') {
        return lessonUrl; // PDFs can often be embedded directly
    }
    return null; // Audio, docx handled differently
}

/**
 * Finds the next lesson ID in the list.
 */
export function getNextLessonId(lessons: Lesson[], currentLessonId: string): string | null {
    const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex === -1 || currentIndex >= lessons.length - 1) {
        return null;
    }
    return lessons[currentIndex + 1].id;
}

// ========================================
// 3. Content Viewer Component
// ========================================
interface ContentViewerProps {
    lesson: Lesson | undefined;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ lesson }) => {
    // Styles inside component for single file simplicity
    const viewerContainerStyle: React.CSSProperties = {
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f0f2f5',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        padding: '16px',
    };

    const iframeContainerStyle: React.CSSProperties = {
        position: 'relative',
        paddingBottom: '56.25%', // 16:9
        height: 0,
        overflow: 'hidden',
        backgroundColor: '#000',
        width: '100%',
        borderRadius: 'inherit',
    };

    const iframeStyle: React.CSSProperties = {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none',
    };

     const audioStyle: React.CSSProperties = {
        width: '80%', maxWidth: '600px', marginTop: '20px',
    };

    if (!lesson) {
        return (
            <div style={viewerContainerStyle}>
                <Result status="warning" title="لم يتم العثور على الدرس" subTitle="الرجاء تحديد درس من القائمة." />
            </div>
        );
    }

    const embedUrl = getEmbedUrl(lesson.url, lesson.type);

    const renderContent = () => {
        switch (lesson.type) {
            case 'embedded':
            case 'video':
                if (embedUrl && getYouTubeId(lesson.url)) { // Specifically check for YouTube embed
                    return (
                        <div style={{...iframeContainerStyle, borderRadius: '8px'}}>
                            <iframe key={lesson.id} style={iframeStyle} src={embedUrl} title={lesson.title || 'Video Player'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                        </div>
                    );
                }
                // Fallback for non-YouTube video or direct video links
                return (
                     <div style={viewerContainerStyle}>
                        {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
<video controls key={lesson.id} style={{ maxWidth: '100%', maxHeight: 'calc(100% - 40px)', borderRadius: 'inherit' }}>
                             <source src={lesson.url} />
                             متصفحك لا يدعم عرض الفيديو. <a href={lesson.url} target="_blank" rel="noopener noreferrer">تحميل الفيديو</a>
                        </video>
                     </div>
                 );

            case 'pdf':
                 return (
                    <div style={{...iframeContainerStyle, borderRadius: '8px'}}>
                        <iframe key={lesson.id} style={iframeStyle} src={lesson.url} title={lesson.title || 'PDF Viewer'}>
                            <Paragraph style={{ padding: '20px' }}> لا يمكن عرض ملف PDF في المتصفح.
                                <a href={lesson.url} target="_blank" rel="noopener noreferrer" download>
                                    <Button type="link" icon={<DownloadOutlined />}>تحميل الملف</Button>
                                </a>
                            </Paragraph>
                        </iframe>
                    </div>
                );

            case 'audio':
                return (
                    <div style={viewerContainerStyle}>
                        <Title level={4}>{lesson.title}</Title>
                        {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
<audio controls key={lesson.id} style={audioStyle} src={lesson.url}>
                            متصفحك لا يدعم تشغيل الصوت. <a href={lesson.url} target="_blank" rel="noopener noreferrer" download> تحميل الملف الصوتي</a>
                        </audio>
                        {lesson.description && <Paragraph style={{marginTop: '15px'}}>{lesson.description}</Paragraph>}
                    </div>
                );

            case 'docx':
                return (
                    <div style={viewerContainerStyle}>
                         <Result
                            // icon={<img src="/path/to/docx-icon.png" alt="DOCX Icon" width="64" /> /* Add icon path */}
                            icon={<FileTextOutlined style={{fontSize: '64px', color: '#1890ff'}}/>} // Placeholder icon
                            title={`ملف وورد: ${lesson.title}`}
                            subTitle="لا يمكن عرض هذا النوع من الملفات مباشرة. يرجى تحميله."
                            extra={ <Button type="primary" icon={<DownloadOutlined />} href={lesson.url} target="_blank" rel="noopener noreferrer" download> تحميل ({lesson.title}.docx) </Button> }
                        />
                    </div>
                );
 
            default:
                return (
                    <div style={viewerContainerStyle}>
                         <Result
                            status="info" icon={<WarningOutlined />} title={`ملف: ${lesson.title}`}
                            subTitle={`نوع الملف (${lesson.type || 'غير معروف'}) غير مدعوم للعرض المباشر.`}
                            extra={ <Button type="primary" icon={<DownloadOutlined />} href={lesson.url} target="_blank" rel="noopener noreferrer" download> تحميل الملف </Button> }
                        />
                    </div>
                );
        }
    };

     const viewerWrapperStyle: React.CSSProperties = {
        flexGrow: 1, display: 'flex', flexDirection: 'column', marginBottom: '16px', width: '100%',
    };

    return <div style={viewerWrapperStyle}>{renderContent()}</div>;
};

// ========================================
// 4. Playlist Component
// ========================================
interface LecturePlaylistProps {
    lessons: Lesson[];
    selectedLessonId: string | null;
    visible: boolean;
    onLessonClick: (lessonId: string) => void;
    onClose: () => void;
}

const LecturePlaylist: React.FC<LecturePlaylistProps> = ({
    lessons, selectedLessonId, visible, onLessonClick, onClose,
}) => {
    // Styles
    const siderStyle: React.CSSProperties = {
        background: '#f0f2f5', padding: '10px', height: 'calc(100vh - 64px)',
        overflowY: 'auto', transition: 'all 0.2s ease-in-out', borderRight: '1px solid #e8e8e8',
    };
    const playlistHeaderStyle: React.CSSProperties = {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #e0e0e0',
    };
    const listItemStyleBase: React.CSSProperties = {
        padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', marginBottom: '5px',
        transition: 'background-color 0.2s ease, color 0.2s ease', backgroundColor: 'transparent',
        color: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center',
    };
    const listItemStyleSelected: React.CSSProperties = {
        ...listItemStyleBase, backgroundColor: '#1890ff', color: '#fff', fontWeight: 500,
    };

    return (
        <Sider width={300} theme="light" collapsible collapsed={!visible} trigger={null} collapsedWidth={0} style={siderStyle} className="lecture-playlist-sider">
            <div style={playlistHeaderStyle}>
                <Title level={5} style={{ margin: 0 }}>قائمة الدروس</Title>
                <Button icon={<RightOutlined />} onClick={onClose} type="text" aria-label="إخفاء القائمة" />
            </div>
            <List itemLayout="horizontal" dataSource={lessons} renderItem={(item, index) => (
                <List.Item onClick={() => onLessonClick(item.id)} style={item.id === selectedLessonId ? listItemStyleSelected : listItemStyleBase}>
                    <List.Item.Meta
                         avatar={<Text style={{ marginLeft: '8px', color: item.id === selectedLessonId ? '#fff' : 'rgba(0, 0, 0, 0.45)' }}>{index + 1}.</Text>}
                        title={<Text style={{ color: item.id === selectedLessonId ? '#fff' : 'inherit', whiteSpace: 'normal' }}>{item.title}</Text>}
                    />
                    {/* {item.id === selectedLessonId && <PlayCircleOutlined style={{ color: '#fff', fontSize: '16px', marginRight: '8px' }} />} */}
                </List.Item>
            )} />
        </Sider>
    );
};

// ========================================
// 5. Actions Component
// ========================================
interface LectureActionsProps {
    lesson: Lesson | undefined;
    onMarkComplete: () => void;
    isLoadingComplete: boolean;
}

const LectureActions: React.FC<LectureActionsProps> = ({ lesson, onMarkComplete, isLoadingComplete }) => {
    const actionButtonsStyle: React.CSSProperties = {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap',
        padding: '16px 0', borderTop: '1px solid #f0f0f0', marginTop: 'auto',
    };

    if (!lesson) return null;

    return (
        <div style={actionButtonsStyle}>
            <Space wrap>
                <Button icon={<DownloadOutlined />} href={lesson.url} target="_blank" rel="noopener noreferrer" download disabled={!lesson.url}>
                    تحميل
                </Button>
                {/* <Button icon={<FileTextOutlined />} disabled> عرض الواجب المنزلي </Button> */}
            </Space>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={onMarkComplete} loading={isLoadingComplete} style={{ minWidth: '140px' }} disabled={isLoadingComplete}>
                {isLoadingComplete ? 'جاري...' : 'إكمال الدرس'}
            </Button>
        </div>
    );
};

// ========================================
// 6. Breadcrumb Component
// ========================================
interface LectureBreadcrumbProps {
    lesson: Lesson | undefined;
}

const LectureBreadcrumb: React.FC<LectureBreadcrumbProps> = ({ lesson }) => {
    return (
        <Breadcrumb separator="›" style={{ marginBottom: '5px'}}>
            <Breadcrumb.Item href="#"> <HomeOutlined /> <span style={{ marginRight: '4px' }}>{lesson?.programName || 'البرنامج الدراسي'}</span> </Breadcrumb.Item>
            <Breadcrumb.Item href="#"> <ReadOutlined /> <span style={{ marginRight: '4px' }}>{lesson?.subjectName || 'المادة'}</span> </Breadcrumb.Item>
            <Breadcrumb.Item> <VideoCameraOutlined /> <span style={{ marginRight: '4px' }}>{lesson?.title || 'الدرس الحالي'}</span> </Breadcrumb.Item>
        </Breadcrumb>
    );
};

// ========================================
// 7. Main Page Component
// ========================================
const LecturePageSingleFile: React.FC<LecturePageProps> = ({
    lessons = [],
    initialLessonId
}) => {
    const [playlistVisible, setPlaylistVisible] = useState(false);
    const [isLoadingComplete, setIsLoadingComplete] = useState(false);

    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(() => {
        const validInitialId = initialLessonId && lessons.some(l => l.id === initialLessonId) ? initialLessonId : null;
        return validInitialId || (lessons.length > 0 ? lessons[0].id : null);
    });

    const currentLesson = useMemo(() => {
        return lessons.find(l => l.id === selectedLessonId);
    }, [selectedLessonId, lessons]);

    useEffect(() => {
        if (selectedLessonId && !lessons.some(l => l.id === selectedLessonId)) {
            setSelectedLessonId(lessons.length > 0 ? lessons[0].id : null);
        } else if (!selectedLessonId && lessons.length > 0) {
            setSelectedLessonId(lessons[0].id);
        }
    }, [lessons, selectedLessonId]);

    const togglePlaylist = () => setPlaylistVisible(!playlistVisible);

    const handleLessonClick = (lessonId: string) => {
        if (lessonId !== selectedLessonId) setSelectedLessonId(lessonId);
    };

    const handleMarkComplete = async () => {
        if (!selectedLessonId || isLoadingComplete) return;
        setIsLoadingComplete(true);
        message.loading({ content: 'جاري تحديث حالة الدرس...', key: 'completeStatus', duration: 0 }); // Keep loading msg

        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

        try {
            // --- Replace with actual API call ---
            console.log(`API call: Mark lesson ${selectedLessonId} complete`);
            // await api.markLessonComplete(selectedLessonId);
            // ------------------------------------

            message.success({ content: 'تم إكمال الدرس بنجاح!', key: 'completeStatus', duration: 2 });
            const nextLessonId = getNextLessonId(lessons, selectedLessonId);
            if (nextLessonId) {
                setSelectedLessonId(nextLessonId);
            } else {
                 message.info({ content: 'لقد أكملت جميع الدروس!', key: 'completeStatus', duration: 3 });
                 // Handle completion of all lessons (e.g., navigate away)
            }
        } catch (error) {
            console.error("Failed to mark lesson complete:", error);
            message.error({ content: 'فشل تحديث حالة الدرس.', key: 'completeStatus', duration: 3 });
        } finally {
            setIsLoadingComplete(false);
        }
    };

    // Styles for Page
    const mainLayoutStyle: React.CSSProperties = { minHeight: '100vh' };
    const contentLayoutStyle: React.CSSProperties = {};
    const contentStyle: React.CSSProperties = {
        padding: '24px', minHeight: 'calc(100vh - 64px)', backgroundColor: '#fff',
        display: 'flex', flexDirection: 'column', position: 'relative',
    };
    const topBarStyle: React.CSSProperties = {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', marginBottom: '16px',
    };

    return (
        <ConfigProvider direction="rtl" locale={arEG}>
            <Layout style={mainLayoutStyle}>
                <Layout style={contentLayoutStyle}> {/* Content Layout */}
                    <Content style={contentStyle}>
                        <div style={topBarStyle}>
                           <LectureBreadcrumb lesson={currentLesson} />
                           {!playlistVisible && ( <Button icon={<UnorderedListOutlined />} onClick={togglePlaylist} aria-label="عرض قائمة الدروس"> عرض القائمة </Button> )}
                        </div>
                        <ContentViewer lesson={currentLesson} />
                        <LectureActions lesson={currentLesson} onMarkComplete={handleMarkComplete} isLoadingComplete={isLoadingComplete} />
                    </Content>
                </Layout>
                <LecturePlaylist lessons={lessons} selectedLessonId={selectedLessonId} visible={playlistVisible} onLessonClick={handleLessonClick} onClose={togglePlaylist} />
            </Layout>
        </ConfigProvider>
    );
};

// ========================================
// Example Usage (You'd typically import and use this component elsewhere)
// ========================================

// Sample Data for testing
// const sampleLessonsForTest: Lesson[] = [
//     { id: 'yt1', subjectId: 's1', title: 'مقدمة الدورة (فيديو يوتيوب)', type: 'embedded', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subjectName: 'المادة الأولى', programName: 'برنامج أساسيات الويب' },
//     { id: 'aud1', subjectId: 's1', title: 'شرح صوتي للمفاهيم', type: 'audio', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3', subjectName: 'المادة الأولى', programName: 'برنامج أساسيات الويب' },
//     { id: 'pdf1', subjectId: 's1', title: 'ملف PDF للمراجع', type: 'pdf', url: 'https://smallpdf.com/handle-widget#url=https://assets.ctfassets.net/l3l0sjr15nav/29D2yYGKlHNm0fB2YM1uW4/8e638080a0603252b1a50f35ae8762fd/Get_Started_With_Smallpdf.pdf', subjectName: 'المادة الأولى', programName: 'برنامج أساسيات الويب'},
//     { id: 'docx1', subjectId: 's1', title: 'مستند وورد للمهام', type: 'docx', url: 'https://file-examples.com/storage/fe1134defc6538c86b90e8c/2017/02/file-sample_100kB.docx', subjectName: 'المادة الأولى', programName: 'برنامج أساسيات الويب'}, // Example public docx URL
//     { id: 'unknown1', subjectId: 's1', title: 'ملف غير معروف النوع', type: 'unknown', url: 'https://www.google.com', subjectName: 'المادة الأولى', programName: 'برنامج أساسيات الويب'}, // Example unknown
//     { id: 'last', subjectId: 's1', title: 'الدرس الأخير (فيديو)', type: 'video', url: 'https://www.youtube.com/watch?v=L_LUpnjgPso', subjectName: 'المادة الأولى', programName: 'برنامج أساسيات الويب'},
// ];

// Example of how you might render it in your App.tsx or similar
function App() {
	const { id } = useParams();
  // const {data, refetch, isLoading, isFetching} = useQuery({queryKey: ['programs', id], queryFn: () => api.show(id!), refetchOnWindowFocus:false}); 
  // const {data} = useQuery({queryKey: ['programs', id], queryFn: () => api.show(id!), refetchOnWindowFocus:false});
  const {data:subjectsList} = useQuery({queryKey: ['subjects', id], queryFn: () => api.get({id:id}), refetchOnWindowFocus:false});
  const subject = subjectsList?.items.find((value) => value.id === id)
//   const {data:lessonsList} = useQuery({queryKey: ['lessons', id], queryFn: () => lessonsApi.get({subjectId:id}), refetchOnWindowFocus:false}); 
  
  const lessons = subject?.lessons.map<Lesson>((item:Lesson) => {
      return {
        ...item,
        subjectId: subject?.id,
        subjectName: subject?.name,
      }
  }) ?? [];
   return <LecturePageSingleFile lessons={lessons} initialLessonId="pdf1" />;
}

// You would export the main component if using it in another file:
export default App;