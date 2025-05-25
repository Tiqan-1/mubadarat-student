import type { Lesson } from "@/app/api/services/lessons";
 
import {
    Button,
    Typography,
    Col,
    Card,
  } from 'antd';
import { useNavigate } from "react-router";
   
  
  const { Title, Text, Paragraph } = Typography;


export default function LessonItemCard({item, index}:{item:Lesson, index:number}) {
    const navigate = useNavigate()
    
   const lectureCardStyle : React.CSSProperties = {
    marginBottom: '24px',
    textAlign: 'right', // Ensure text aligns right in RTL
  };

  const placeholderStyle = {
    backgroundColor: '#333',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // height: '180px', // Adjust height as needed or use aspect ratio padding hack
    aspectRatio: '3 / 2', // Use CSS aspect-ratio
    fontSize: '2.5em',
    fontWeight: 'bold',
    width: '100%', // Make it fill the card width
    marginBottom: '12px', // Space below placeholder
    borderRadius: '4px 4px 0 0' // Round top corners slightly
  };

  const cardHeaderStyle = {
     fontSize: '0.9em',
     color: '#888',
     padding: '8px 16px',
     backgroundColor: '#fafafa', // Light background for card header
     borderBottom: '1px solid #f0f0f0',
     borderTopLeftRadius: 'inherit', // Inherit radius from card
     borderTopRightRadius: 'inherit'
  };

    return  <Col key={item.id} xs={24} sm={12} md={8} lg={6} xl={6}> {/* 4 columns on large screens */}
      <Card
        hoverable
        style={lectureCardStyle}
        bodyStyle={{ padding: '16px' }} // Add padding back to body
        // Use cover prop for image, or custom div
        // cover={<div style={placeholderStyle}>{item.thumbnailAspectRatio}</div>}
      >
         {/* Custom Header for Lecture Number */}
          <div style={cardHeaderStyle}>
             المحاضرة {index}
          </div>
          {/* Thumbnail Placeholder */}
          <div style={placeholderStyle}>
             2:3
          </div>

          {/* Card Content */}
         <Title level={5} style={{ marginBottom: '4px' }}>{item.title}</Title>
         <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em' }}>
           {item.subjectName ?? 'المادة الأولى'}  
         </Text>
         <Paragraph ellipsis={{ rows: 3 }} style={{ marginBottom: '16px', minHeight: '60px', fontSize: '0.9em' }}>
           {item.description}
         </Paragraph>
         <Button type="primary" block  onClick={() => navigate(`/playlist/${item.subjectId}`) }> 
           إبدأ الدرس  
         </Button>
      </Card>
    </Col>
}