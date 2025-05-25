 
import {
  Layout, 
  Typography,
  Space,
  Row,
  Tabs 
} from 'antd';
import {  
  InfoCircleOutlined, // Generic info/overview
  QuestionCircleOutlined, // Q&A
  EditOutlined, // Assignments
} from '@ant-design/icons';
 
import SubjectHeader from './subject-header';
import LessonItemCard from './lesson-card';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import api, { type Lesson } from "@/app/api/services/subjects"; 

const {   Content } = Layout;
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;  
 

 
const SubjectDetailsPage = () => { 
	const { id } = useParams();
  // const {data, refetch, isLoading, isFetching} = useQuery({queryKey: ['programs', id], queryFn: () => api.show(id!), refetchOnWindowFocus:false}); 
  // const {data} = useQuery({queryKey: ['programs', id], queryFn: () => api.show(id!), refetchOnWindowFocus:false});
  const {data:subjectsList} = useQuery({queryKey: ['subjects', id], queryFn: () => api.get({id:id}), refetchOnWindowFocus:false});
  const subject = subjectsList?.items.find((value) => value.id === id)
  // const {data:lessonsList} = useQuery({queryKey: ['lessons', id], queryFn: () => lessonsApi.get({subjectId:id}), refetchOnWindowFocus:false}); 
  
  const lessons = subject?.lessons.map<Lesson>((item:Lesson) => {
      return {
        ...item,
        subjectId: subject?.id,
        subjectName: subject?.name,
      }
  }) ?? [];

  return <Content style={{ padding: '0 48px', marginTop: '8px' }}>
          {/* --- Subject Header Section --- */}
          <SubjectHeader subject={subject} />
          {/* --- Tabs Section --- */}
          <Tabs defaultActiveKey="overview" type="card">
             <TabPane
                tab={
                   <Space><InfoCircleOutlined /> نظرة عامة</Space>
                }
                key="overview"
             >
                {/* Content for Overview Tab */}
                 <div style={{ margin: '24px 0' }}>
                   <Title level={4}>وصف المادة</Title>
                   <Paragraph style={{ lineHeight: '1.8' }}>
                     {subject?.description}
                   </Paragraph>
                 </div>

                 <div style={{ margin: '32px 0' }}>
                   <Title level={4} style={{ marginBottom: '24px' }}>المحاضرات</Title>
                   <Row gutter={[24, 24]}> {/* Grid for lectures */}
                     {lessons.map((lecture, index) => ( <LessonItemCard key={lecture.id} item={lecture} index={index+1} /> ))}
                   </Row>
                 </div>
             </TabPane>
             <TabPane
                 tab={
                    <Space><QuestionCircleOutlined /> أسئلة و أجوبة</Space>
                 }
                 key="qa"
             >
                <div style={{ padding: '24px' }}>
                    <Title level={4}>أسئلة و أجوبة</Title>
                    <Paragraph>محتوى قسم الأسئلة والأجوبة سيظهر هنا...</Paragraph>
                    {/* Add Q&A components here */}
                </div>
             </TabPane>
             <TabPane
                  tab={
                    <Space><EditOutlined /> واجبات</Space>
                  }
                  key="assignments"
             >
                 <div style={{ padding: '24px' }}>
                    <Title level={4}>واجبات</Title>
                    <Paragraph>محتوى قسم الواجبات سيظهر هنا...</Paragraph>
                    {/* Add Assignments components here */}
                </div>
             </TabPane>
          </Tabs>

        </Content>;
};

export default SubjectDetailsPage;