import type React from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import {
    CalendarOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import type { Level, Program } from '@/app/api/services/programs';


dayjs.locale('ar'); // Set locale for formatting

const { Text, Title } = Typography;
 

interface LevelCardProps {
    level: Level;
    program: Program | null | undefined;
}

// --- Helper Function for Date Formatting ---
const formatLevelDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "غير محدد";
    try {
        const d = dayjs(dateString);
        if (!d.isValid()) return "تاريخ غير صالح";
        // Example format: "الأربعاء, ٢٤ أبريل ٢٠٢٥"
        return d.format('dddd, D MMMM YYYY');
    } catch (e) {
        return "خطأ";
    }
};

// --- The Card Component ---
const LevelItemCard: React.FC<LevelCardProps> = ({ level }) => {
    const taskCount = level.tasks?.length || 0;

    return (
        <Card
            style={{ marginBottom: '16px', direction: 'rtl' }}
            title={<Title level={5} style={{ margin: 0 }}>{level.name || "مستوى بدون اسم"}</Title>}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* Dates Section */}
                <Space direction="vertical" >
                    <Text type="secondary">
                        <CalendarOutlined style={{ marginLeft: '8px' }} />
                        فترة المستوى:
                    </Text>
                    <Text>
                        <Tag color="green">{formatLevelDate(level.start)}</Tag>
                         إلى
                        <Tag color="red" style={{ marginRight: '5px' }}>{formatLevelDate(level.end)}</Tag>
                    </Text>
                </Space>

                {/* Task Count Section */}
                <Space>
                    <UnorderedListOutlined style={{ marginLeft: '8px', color: '#888' }} />
                    <Text type="secondary">عدد المهام:</Text>
                    <Tag color="blue">{taskCount}</Tag>
                </Space>

            </Space>
        </Card>
    );
};

export default LevelItemCard;