import type React from 'react';
import { useState } from 'react';
import {
    Layout,
    Breadcrumb,
    Button,
    Space,
    Typography,
    List,
    ConfigProvider,
} from 'antd';
import {
    UnorderedListOutlined,
    DownloadOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    LeftOutlined, // Use LeftOutlined for the Hide button inside the left Sider
    PlayCircleOutlined,
    HomeOutlined,   // For Breadcrumb
    ReadOutlined,   // For Breadcrumb
    BookOutlined,   // For Breadcrumb
    VideoCameraOutlined, // For Breadcrumb
} from '@ant-design/icons';
import arEG from 'antd/lib/locale/ar_EG';

const { Content, Sider } = Layout;
const { Text, Title } = Typography;

// --- Dummy Data ---
const lessonsData = [
    { id: 'dQw4w9WgXcQ', title: 'المحاضرة رقم 1: مقدمة' }, // Example YouTube ID
    { id: 'L_LUpnjgPso', title: 'المحاضرة رقم 2: الأساسيات' },
    { id: '3JZ_D3ELwOQ', title: 'المحاضرة رقم 3: المفاهيم المتقدمة' },
    { id: 'a3Z7zEc7AXQ', title: 'المحاضرة رقم 4: ورشة عمل' },
    { id: '6_b7RDuL6XA', title: 'المحاضرة رقم 5: التطبيقات العملية' },
    { id: 'h6fcK_fRYaI', title: 'المحاضرة رقم 6: دراسة حالة' },
    { id: 'kJQP7kiw5Fk', title: 'المحاضرة رقم 7: مراجعة وختام' },
    // Add more lessons
];

// Example: Set initially selected lesson based on index or fetch from props/state
const currentLessonIndex = 3;
const initialSelectedLesson = lessonsData[currentLessonIndex] || lessonsData[0]; // Fallback to first lesson

// --- Component ---
const LecturePage: React.FC = () => {
    const [playlistVisible, setPlaylistVisible] = useState(false); // Playlist hidden initially
    const [lessonCompleted, setLessonCompleted] = useState(false);
    const [selectedLessonId, setSelectedLessonId] = useState(initialSelectedLesson.id);

    const togglePlaylist = () => {
        setPlaylistVisible(!playlistVisible);
    };

    const handleMarkComplete = () => {
        setLessonCompleted(!lessonCompleted);
        // Add logic here to persist completion status (e.g., API call)
        console.log(`Lesson ${selectedLessonId} marked as ${!lessonCompleted ? 'complete' : 'incomplete'}`);
    };

    const handleLessonClick = (lessonId: string) => {
        console.log("Selected Lesson ID:", lessonId);
        setSelectedLessonId(lessonId);
        // Optional: Automatically play the new video or perform other actions
        // Optional: Close playlist on mobile after selection
        // if (window.innerWidth < 768 && playlistVisible) {
        //     setPlaylistVisible(false);
        // }
    };

    // --- Styles ---
    const contentStyle: React.CSSProperties = {
        padding: '24px',
        minHeight: 'calc(100vh - 64px)', // Adjust based on actual header height
        backgroundColor: '#fff', // White background for content area
        display: 'flex',
        flexDirection: 'column',
    };

    const topBarStyle: React.CSSProperties = {
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap', // Allow wrapping on smaller screens
    };

    const videoContainerStyle: React.CSSProperties = {
        position: 'relative',
        paddingBottom: '56.25%', // 16:9 aspect ratio
        height: 0,
        overflow: 'hidden',
        backgroundColor: '#000', // Black background while loading/placeholder
        flexGrow: 1, // Allow video container to take up space
        marginBottom: '16px',
        borderRadius: '8px', // Slightly rounded corners
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Optional shadow for depth
    };

    const iframeStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none', // Remove iframe border
    };

    const actionButtonsStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between', // Space out buttons
        alignItems: 'center',
        flexWrap: 'wrap', // Allow wrapping
        padding: '16px 0',
        borderTop: '1px solid #f0f0f0', // Separator line
        marginTop: 'auto', // Push buttons to the bottom
    };

    const siderStyle: React.CSSProperties = { // Style for LEFT Sider
        background: '#f0f2f5',
        padding: '10px',
        height: 'calc(100vh - 64px)', // Match content height (adjust if header height is different)
        overflowY: 'auto', // Allow scrolling if list is long
        transition: 'all 0.2s ease-in-out', // Smooth transition for collapse/expand and border
        borderRight: '1px solid #e8e8e8', // Border on the RIGHT (between left sider and content)
        ...(!playlistVisible && {display: 'none'})
    };

    const playlistHeaderStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid #e0e0e0',
    }

    const listItemStyleBase: React.CSSProperties = {
        padding: '10px 15px',
        cursor: 'pointer',
        borderRadius: '4px',
        marginBottom: '5px', // Space between items
        transition: 'background-color 0.2s ease, color 0.2s ease',
        backgroundColor: 'transparent', // Explicitly set base background
        color: 'rgba(0, 0, 0, 0.85)', // Default text color
        display: 'flex', // Ensure proper alignment
        alignItems: 'center', // Vertically center content
    }

    const listItemStyleSelected: React.CSSProperties = {
        ...listItemStyleBase,
        backgroundColor: '#1890ff', // Ant Design primary blue for selected
        color: '#fff', // White text for selected
        fontWeight: 500, // Slightly bolder
    }

    // Find the title of the currently selected lesson for the breadcrumb
    const currentSelectedLessonTitle = lessonsData.find(l => l.id === selectedLessonId)?.title || "المحاضرة الحالية";


    return (
        <ConfigProvider direction="rtl" locale={arEG}>
            <Layout style={{ minHeight: '100vh' }}>

                {/* Main Content Area (comes FIRST for LEFT Sider in RTL) */}
                <Layout>
                    <Content style={contentStyle}>
                        {/* Top Bar: Breadcrumbs & Show Playlist Button */}
                        <div style={topBarStyle}>
                            <Breadcrumb separator="›">
                                <Breadcrumb.Item href="#">
                                    <HomeOutlined />
                                    <span style={{ marginRight: '4px' }}>البرنامج الدراسي</span>
                                </Breadcrumb.Item>
                                <Breadcrumb.Item href="#">
                                    <ReadOutlined />
                                    <span style={{ marginRight: '4px' }}>الفصل الأول</span>
                                </Breadcrumb.Item>
                                <Breadcrumb.Item href="#">
                                    <BookOutlined />
                                    <span style={{ marginRight: '4px' }}>المادة الثانية</span>
                                </Breadcrumb.Item>
                                <Breadcrumb.Item>
                                    <VideoCameraOutlined />
                                    <span style={{ marginRight: '4px' }}>{currentSelectedLessonTitle}</span>
                                </Breadcrumb.Item>
                            </Breadcrumb>

                            {!playlistVisible && ( // Only show button if playlist is hidden
                                <Button
                                    icon={<UnorderedListOutlined />} // You could use LeftOutlined here too
                                    onClick={togglePlaylist}
                                    aria-label="عرض قائمة الدروس"
                                >
                                    عرض القائمة
                                </Button>
                             )}
                        </div>

                        {/* Video Player */}
                        <div style={videoContainerStyle}>
                            <iframe
                                key={selectedLessonId} // Add key to force re-render on source change
                                style={iframeStyle}
                                src={`https://www.youtube.com/embed/${selectedLessonId}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&hl=ar`}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>

                        {/* Action Buttons */}
                        <div style={actionButtonsStyle}>
                            <Space wrap> {/* Wrap allows buttons to go to next line if needed */}
                                <Button icon={<DownloadOutlined />}>تحميل المقرر</Button>
                                <Button icon={<FileTextOutlined />}>عرض الواجب المنزلي</Button>
                            </Space>
                            <Button
                                type={lessonCompleted ? "default" : "primary"}
                                icon={<CheckCircleOutlined />}
                                onClick={handleMarkComplete}
                                ghost={lessonCompleted} // Use outline style when completed
                                style={{ minWidth: '140px' }} // Ensure minimum width
                            >
                                {lessonCompleted ? 'مكتمل' : 'إكمال الدرس ؟'}
                            </Button>
                        </div>
                    </Content>
                </Layout>

                {/* Playlist Sider (comes AFTER content layout for LEFT Sider in RTL) */}
                <Sider
                    width={300}
                    theme="light"
                    collapsible
                    collapsed={!playlistVisible}
                    trigger={null} // We use custom buttons
                    collapsedWidth={0} // Hide completely when collapsed
                    style={siderStyle} // Use the modified style with borderRight
                    className="lecture-playlist-sider" // Add class for potential CSS targeting
                >
                    <div style={playlistHeaderStyle}>
                         <Title level={5} style={{ margin: 0 }}>قائمة الدروس</Title>
                         <Button
                            icon={<LeftOutlined />} // Icon to collapse towards the left edge in RTL
                            onClick={togglePlaylist}
                            type="text"
                            aria-label="إخفاء القائمة"
                         />
                     </div>
                    <List
                        itemLayout="horizontal"
                        dataSource={lessonsData}
                        renderItem={(item, index) => (
                            <List.Item
                                onClick={() => handleLessonClick(item.id)}
                                style={item.id === selectedLessonId ? listItemStyleSelected : listItemStyleBase}
                                className={item.id === selectedLessonId ? 'ant-list-item-selected' : ''} // Add class for easier selection styling if needed
                            >
                                <List.Item.Meta
                                     avatar={
                                        <Text
                                            style={{
                                                marginLeft: '8px', // Add margin for spacing in RTL
                                                color: item.id === selectedLessonId ? '#fff' : 'rgba(0, 0, 0, 0.45)'
                                             }}
                                        >
                                            {index + 1}.
                                        </Text>
                                     }
                                    title={<Text style={{ color: item.id === selectedLessonId ? '#fff' : 'inherit' }}>{item.title}</Text>}
                                />
                                {item.id === selectedLessonId && <PlayCircleOutlined style={{ color: '#fff', fontSize: '16px', marginRight: '8px' }} />}
                            </List.Item>
                        )}
                    />
                </Sider>

            </Layout>
        </ConfigProvider>
    );
};

export default LecturePage;