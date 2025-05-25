import type React from 'react';
import {
    Typography,
    Space,
    Row,
    Col,
    Tooltip} from 'antd';
import {
    ClusterOutlined, // For Levels
    UnorderedListOutlined, // For Tasks
    VideoCameraOutlined, // For Lessons (assuming many are videos)
    CalendarOutlined, // For Start Date
    CalendarFilled
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import type { Program } from '@/app/api/services/programs';

dayjs.locale('ar');

const { Title, Text, Paragraph } = Typography;

interface ProgramPageHeaderProps {
    program: Program | null | undefined; // Allow null/undefined for loading state
}

// --- Helper Function for Date Formatting ---
const formatHeaderDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "غير محدد";
    try {
        const d = dayjs(dateString);
        if (!d.isValid()) return "تاريخ غير صالح";
        // Example format: "الجمعة, ٩ مايو ٢٠٢٥"
        return d.format('dddd, D MMMM YYYY');
    } catch (e) {
        return "خطأ";
    }
};

// --- Helper Function for State Tag ---


// --- The Header Component ---
const ProgramPageHeader: React.FC<ProgramPageHeaderProps> = ({ program }) => {

    // Handle loading/null state
    if (!program) {
        // Optional: Render a loading skeleton or null
        return null; // Or <Skeleton active />;
    }

    // Calculate overview numbers safely
    const levelCount = program.levels?.length || 0;
    const totalTasks = program.levels?.reduce((sum, level) => sum + (level.tasks?.length || 0), 0) || 0;
    const totalLessons = program.levels?.reduce((sum, level) =>
        sum + (level.tasks?.reduce((taskSum, task) =>
            taskSum + (task.lessons?.length || 0), 0) || 0), 0) || 0;

    const formattedStartDate = formatHeaderDate(program.start);
    const formattedRegistrationEndDate = formatHeaderDate(program.registrationEnd);

    // Style for the container
    const programHeaderStyle: React.CSSProperties = {
        // backgroundColor: '#003d2b', // Darker Green Background
        backgroundImage: 'linear-gradient(to right, #003d2b, #18a978)', // Optional Gradient
        padding: '24px 32px', // Increased padding
        borderRadius: '8px',
        color: '#fff',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Optional shadow
        direction: 'rtl', // Ensure RTL direction
    }; 
    return (
        <div style={programHeaderStyle}>

            <Row justify="space-between" align="top" gutter={[16, 8]}>
              <Col flex="auto">
                    <Title level={2} style={{ color: '#fff', margin: '0 0 8px 0' }}>
                        {program.name || "برنامج بدون عنوان"}
                    </Title>
              </Col>
              <Col flex="auto" style={{textAlign: 'end'}}>
                        <Tooltip title="تاريخ إنتهاء التسجيل">
                             <Text style={{ color: '#eee', fontSize: '0.9em' }}> <CalendarOutlined style={{ marginLeft: '5px' }} /> {formattedRegistrationEndDate} </Text>
                        </Tooltip>
              </Col>
            </Row>

            <Row justify="space-between" align="top" gutter={[16, 8]}>
              <Col flex="auto">
                    <Paragraph style={{ color: '#eee', marginBottom: '16px' }} ellipsis={{ rows: 2, expandable: false }}>
                        {program.description || "لا يوجد وصف لهذا البرنامج."}
                    </Paragraph>
              </Col>
            </Row>

            <Row justify="space-between" align="top" gutter={[16, 8]}>
              <Col flex="auto">
                    <Space size="large" wrap>
                        <Tooltip title="عدد المستويات">
                            <Space> <ClusterOutlined /> <Text style={{ color: '#fff' }}>{levelCount} مستويات</Text> </Space>
                        </Tooltip>
                         <Tooltip title="إجمالي عدد المهام">
                            <Space> <UnorderedListOutlined /> <Text style={{ color: '#fff' }}>{totalTasks} مهام</Text> </Space>
                        </Tooltip>
                        <Tooltip title="إجمالي عدد الدروس">
                             <Space> <VideoCameraOutlined /> <Text style={{ color: '#fff' }}>{totalLessons} دروس</Text> </Space>
                        </Tooltip>
                    </Space>
              </Col>
              <Col flex="auto" style={{textAlign: 'end'}}>
                        <Tooltip title="تاريخ البدء">
                             <Text style={{ color: '#eee', fontSize: '0.9em' }}> <CalendarFilled style={{ marginLeft: '5px' }} /> {formattedStartDate} </Text>
                        </Tooltip>
              </Col>
            </Row>
 
        </div>
    );
};

export default ProgramPageHeader;

// --- Example Usage ---
/*
import React from 'react';
import ProgramPageHeader, { Program } from './ProgramPageHeader';

const MyProgramScreen: React.FC = () => {
    // Assuming 'programData' is fetched and matches the Program interface
    const programData: Program = {
         "id": "67fe34827d47dcd153437d8d",
         "name": "صرح العربية",
         "state": "published",
         "thumbnail": "xxx",
         "description": "برنامج يهدف إلى رفع السوية اللغوية للطالب.\nيبدأ البرنامج تدريجيًا من الأسس البسيطة ليناسب الطالب المبتدئ تمامًا والمتوسط.",
         "start": "2025-05-09T22:00:00.000Z",
         "end": "2025-06-09T22:00:00.000Z",
         "createdBy": { "name": "Moaz Manager", "email": "moaz-manager@email.com" },
         "registrationStart": "2025-04-15T22:00:00.000Z",
         "registrationEnd": "2025-05-09T22:00:00.000Z",
         "levels": [ { id: "level1", name: "Level 1", tasks: [ { id: "t1", lessons: [{id: 'l1'}, {id: 'l2'}] }, { id: "t2", lessons: [{id: 'l3'}] } ] }, { id: "level2", name: "Level 2", tasks: [ { id: "t3", lessons: [{id: 'l4'}, {id: 'l5'}, {id: 'l6'}] } ] } ]
    }; // Simplified levels/tasks for brevity in example

    return (
        <div>
            <ProgramPageHeader program={programData} />
            {/* Rest of the program screen content * /}
        </div>
    );
};
*/