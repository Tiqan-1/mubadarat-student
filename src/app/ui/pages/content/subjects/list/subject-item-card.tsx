 
 
import { 
  Card,
    Button,
    Typography, 
    Row,
    Col,
    Progress, 
  } from 'antd'; 

import type { Subject } from "@/app/api/services/subjects"; 
import { useNavigate } from 'react-router';
   
    
  const { Title, Text, Paragraph } = Typography;

export default function SubjectItemCard({item}:{item:Subject}){
  const navigate = useNavigate()
  const subjectProgress = 10
  const subjectLevel= 'المستوى الأول'

   const moduleCardStyle = {
     marginBottom: '24px',
     overflow: 'hidden', // Ensure progress bar fits nicely
   };

   const placeholderStyle = {
     backgroundColor: '#333', // Dark background for placeholder
     color: '#fff',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center',
     height: '150px', // Fixed height for consistency
     fontSize: '2em',
     fontWeight: 'bold',
     borderRadius: '4px 0 0 4px' // Rounded corners only on the left for RTL
   };
    return <Col key={item.id} xs={24} sm={24} md={12} lg={12} xl={12}> {/* 2 columns on medium screens and up */}
      <Card hoverable style={moduleCardStyle} styles={{ body: { padding: 0 } }}> {/* Remove default padding */}
        <Row wrap={false}> {/* Prevent wrapping for side-by-side layout */}
           {/* Image/Placeholder Column */}
           <Col flex="100px"> {/* Fixed width for placeholder */}
              <div style={placeholderStyle}>
                {"2:3"}
              </div>
           </Col>

           {/* Content Column */}
           <Col flex="auto" style={{ padding: '16px' }}>
             <Title level={5}>{item.name}</Title>
             <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
               {subjectLevel}
             </Text>
             <Paragraph ellipsis={{ rows: 3 }} style={{ marginBottom: '16px', minHeight: '60px' }}> {/* Ensure minimum height */}
               {item.description}
             </Paragraph>
             <Button type="primary" onClick={() => navigate(`/subjects/${item.id}`) }>إبدأ</Button>
           </Col>
        </Row>
         {/* Progress Bar - Placed outside the inner Row, spanning full width */}
        <Progress percent={subjectProgress} showInfo={true} style={{ padding: '0 16px 8px 16px' }} /> {/* Add padding for progress */}
      </Card>
    </Col>
  

}