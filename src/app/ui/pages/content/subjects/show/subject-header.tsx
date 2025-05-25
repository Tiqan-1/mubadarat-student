import type { Subject } from "@/app/api/services/subjects";
 
import { 
    Button,
    Typography,
    Space,
    Row,
    Col, 
  } from 'antd';
  import { 
    ClusterOutlined, // For Levels
    VideoCameraOutlined, // For Lectures/Lessons
    ClockCircleOutlined, // For Duration 
  } from '@ant-design/icons';
   
   
  const { Title, Text  } = Typography; 



export default function SubjectHeader({subject}:{subject:Subject|undefined}) {
    const subjectHeaderStyle = {
      backgroundColor: '#003d2b', // Darker Green background from image
      padding: '24px',
      borderRadius: '8px',
      color: '#fff',
      marginBottom: '24px',
    };
  
    return <div style={subjectHeaderStyle}>
       <Row justify="space-between" align="middle">
           <Col>
              <Text style={{ color: '#ccc', fontSize: '0.9em' }}>عنوان البرنامج الدراسي</Text>
              <Title level={1} style={{ color: '#fff', margin: '8px 0 16px 0' }}>{subject?.name}</Title>
              <Space size="large" wrap>
                <Space>
                  <ClusterOutlined />
                  <Text style={{ color: '#fff' }}>المستوى الأول</Text>
                </Space>
                <Space>
                  <VideoCameraOutlined />
                  <Text style={{ color: '#fff' }}>11 محاضرة</Text> {/* Example count */}
                </Space>
                <Space>
                  <ClockCircleOutlined />
                  <Text style={{ color: '#fff' }}>3 ساعات</Text> {/* Example duration */}
                </Space>
              </Space>
           </Col>
           <Col style={{ textAlign: 'left' }}> {/* Align button section to the left in RTL */}
              {/* Removed date, added Continue button */}
              <Button size="large" style={{ background: '#fff', color: '#003d2b', fontWeight: 'bold', border: 'none' }}>
                الإستمرار
              </Button>
           </Col>
      </Row>
    </div>
}