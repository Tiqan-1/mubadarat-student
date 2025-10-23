import type React from 'react';
import {
    Layout,
    Typography,
    Row,
    Col,
    Card,
    Button, 
} from 'antd'; 

 
import { useQuery } from "@tanstack/react-query";
import api from "@/app/api/services/programs";  
import { useNavigate } from 'react-router';
 
const { Content } = Layout;
const { Title, Paragraph } = Typography;
 
   
export default function ProgramPage() { 
	const navigate = useNavigate();
    const {data} = useQuery({queryKey: ['programs'], queryFn: () => api.getOpen(), refetchOnWindowFocus:false}); 
 
 
    // Styles
    const welcomeSectionStyle: React.CSSProperties = {
        backgroundColor: '#e6f4ea', // Light green background from image
        padding: '60px 24px',
        textAlign: 'center',
        marginBottom: '32px',
        borderRadius: '8px', // Optional rounding
    };

    const programCardStyle: React.CSSProperties = {
        marginBottom: '24px',
        textAlign: 'right', // Ensure text aligns right in RTL
        display: 'flex', // Use flexbox for vertical layout
        flexDirection: 'column', // Stack elements vertically
        height: '100%', // Make cards fill column height
    };

    const placeholderStyle: React.CSSProperties = {
        backgroundColor: '#333',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: '3 / 2', // Maintain aspect ratio
        fontSize: '2.5em',
        fontWeight: 'bold',
        width: '100%',
        borderTopLeftRadius: 'inherit', // Inherit from card if card is rounded
        borderTopRightRadius: 'inherit',
    };

    const cardBodyStyle: React.CSSProperties = {
        padding: '16px',
        flexGrow: 1, // Allow body to grow and push button down
        display: 'flex',
        flexDirection: 'column',
    };

    const cardContentStyle: React.CSSProperties = {
       flexGrow: 1, // Allow content above button to grow
       marginBottom: '16px', // Space between content and button
    };

    return (
        // Assuming ConfigProvider is handled at a higher level for the whole app
        // If not, wrap with <ConfigProvider direction="rtl" locale={arEG}> here
        <Content style={{ padding: '8px 8px', marginTop: '8px' }}> {/* Add padding */}

            {/* --- Welcome Section --- */}
            <div style={welcomeSectionStyle}>
                <Title level={2} style={{ color: '#003d2b', marginBottom: '16px' }}>
                    مرحبا بك في منصة المبادرات التعليمية
                </Title>
                <Paragraph style={{ fontSize: '1.1em', color: '#333' }}>
                    منصة تعليمية دينية تسعى لنشر العلم الشرعي وتعزيز القيم الإيمانية بأسلوبٍ ميسر وتفاعلي.
                </Paragraph>
            </div>

            {/* --- Programs Grid Section --- */}
            <div>
                {/* Optional Title for the section */}
                {/* <Title level={3} style={{ marginBottom: '24px', textAlign: 'right' }}>البرامج المتاحة</Title> */}

                <Row gutter={[24, 24]}> {/* Grid for programs */}
                    {data?.items.map((program) => (
                        <Col key={program.id} xs={24} sm={12} md={8} lg={6}> {/* Responsive grid */}
                            <Card
                                hoverable
                                style={programCardStyle}
                                styles={{body:{ padding: 0 }}} // Remove default body padding, handle in custom div
                                cover={
									program.thumbnail !== undefined ? 
									(<img style={{height:182, objectFit:'fill'}} src={`data:image/png;base64,${program.thumbnail}`} alt="thumbnail" />) 
									: (<div style={placeholderStyle}>2:3</div>)
                                }
                            >
                                {/* Custom Card Body */}
                                <div style={cardBodyStyle}>
                                     <div style={cardContentStyle}>
                                        <Title level={5} style={{ marginBottom: '8px' }}>
                                            {program.name}
                                        </Title>
                                        {/* <Space align="center" style={{ marginBottom: '8px', fontSize: '0.9em' }}>
                                            <ReadOutlined style={{ color: '#888' }} />
                                            <Text type="secondary">{program.studentCount ?? 0} طالبا</Text>
                                        </Space> */}
                                        <Paragraph ellipsis={{ rows: 3 }} type="secondary" style={{ fontSize: '0.9em' }}>
                                            {program.description}
                                        </Paragraph>
                                     </div>
                                    <Button type="primary" block  onClick={() => navigate(`/programs/${program.id}`) }>
                                        عرض البرنامج  
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </Content>
        // </ConfigProvider> // Close ConfigProvider if opened here
    );
}
