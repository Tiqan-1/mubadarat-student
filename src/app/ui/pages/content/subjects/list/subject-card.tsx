import type React from 'react';
import { Card, Typography, Space, Tooltip } from 'antd';
import {
    BookOutlined, // Icon for Subject
    ReadOutlined, // Icon for Lessons
    UserOutlined, // Icon for Creator
} from '@ant-design/icons';
import type { Subject } from '@/app/api/services/subjects';

const { Text, Title, Paragraph } = Typography;

// --- Interfaces matching the JSON structure --- 
interface SubjectCardProps {
    subject: Subject;
    onClick?: (subjectId: string) => void; // Optional click handler
}

// --- The Card Component ---
const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {

    // Safely get lesson count
    const lessonCount = subject.lessons?.length || 0;
    const creatorName = subject.createdBy?.name || 'غير معروف';

    const handleCardClick = () => {
        if (onClick) {
            onClick(subject.id);
        }
    };

    // Style for clickable card
    const clickableCardStyle: React.CSSProperties = onClick ? { cursor: 'pointer' } : {};

    return (
        <Card
            hoverable={!!onClick}
            onClick={handleCardClick}
            style={{ marginBottom: '16px', direction: 'rtl', ...clickableCardStyle }}
            title={
                <Space align="center">
                    <BookOutlined style={{ color: '#1890ff' }}/>
                    <Title level={5} style={{ margin: 0, fontSize: '1.1em' }}>
                        {subject.name || "مادة بدون عنوان"}
                    </Title>
                </Space>
            }
            // Optional: Add extra actions like an edit button etc.
            // extra={<Button type="link">Edit</Button>}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">

                {/* Description */}
                <Paragraph ellipsis={{ rows: 3, expandable: false }}>
                    {subject.description || "لا يوجد وصف لهذه المادة."}
                </Paragraph>

                {/* Metadata Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    {/* Lesson Count */}
                    <Tooltip title="عدد الدروس في هذه المادة">
                        <Space size="small">
                            <ReadOutlined style={{ color: '#888' }} />
                            <Text type="secondary">{lessonCount} دروس</Text>
                        </Space>
                    </Tooltip>

                    {/* Creator */}
                    {subject.createdBy && (
                         <Tooltip title={subject.createdBy.email || ''}>
                            <Space size="small">
                                <UserOutlined style={{ color: '#888' }} />
                                <Text type="secondary">{creatorName}</Text>
                            </Space>
                         </Tooltip>
                    )}
                </div>

            </Space>
        </Card>
    );
};

export default SubjectCard;

// --- Example Usage ---
/*
import React from 'react';
import SubjectCard, { SubjectData } from './SubjectCard';

const MySubjectsList: React.FC = () => {
    const subjectData: SubjectData = {
        "id": "67fd5cea4b6ace6c9f126898",
        "name": "subject 1 ",
        "description": "subject 1 subject 1 subject 1 subject 1 subject 1 subject 1 subject 1 ",
        "createdBy": {
            "name": "yaseen",
            "email": "yassine.dabbous@gmail.com"
        },
        "lessons": [
            { "id": "67fd5dac4b6ace6c9f1268b7", "title": "lesson 1", "type": "video", "url": "..." },
            { "id": "67fd5dc367952856182e9f23", "title": "lesson 2", "type": "pdf", "url": "..." }
        ]
    };

    const handleSubjectClick = (id: string) => {
        console.log("Clicked subject:", id);
        // navigate(`/subjects/${id}`);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '500px' }}>
             <SubjectCard subject={subjectData} onClick={handleSubjectClick} />
             {/* Render more cards */ //}
/*
        </div>
    );
}

export default MySubjectsList;
*/