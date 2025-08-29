 
import { Layout, Typography, Row, Space, Col, Card } from 'antd';   
import { useQuery } from '@tanstack/react-query'; 
import ProgramPageHeader from './program-header';
import { useParams } from 'react-router';
import api from "@/app/api/services/programs";
import subscriptionsApi from "@/app/api/services/subscriptions";
import LevelItemCard from './level-item-card';
import { t } from 'i18next';
import dayjs from 'dayjs';
 

const {  Content } = Layout;
const { Title  } = Typography;

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

const CourseProgramPage = () => { 
	const { id } = useParams(); 
    const {data:programsList} = useQuery({queryKey: ['programs', id], queryFn: () => api.getOpen({id:id}), refetchOnWindowFocus:false});
    const {data:subscriptionsList} = useQuery({queryKey: ['subscriptions', id], queryFn: () => subscriptionsApi.get({programId:id}), refetchOnWindowFocus:false});
    const program = programsList?.items.find((value) => value.id === id)
    
    const subscriptions = subscriptionsList?.items ?? []; 
    if(subscriptions.length > 0 && program!==undefined){
      program.isSubscribed = (subscriptions.filter((value) => value.program.id === program.id).length ?? 0) > 0;
    }
    
    const dates = [
      { title: 'بدء التسجيل', date: formatHeaderDate(program?.registrationStart) },
      { title: "إنتهاء التسجيل", date: formatHeaderDate(program?.registrationEnd) },
      { title: "إنطلاق البرنامج", date: formatHeaderDate(program?.start) },
      { title: "إنتهاء البرنامج", date: formatHeaderDate(program?.end) },
    ];

  return (
    <Content style={{ padding: '0 48px', marginTop: '8px' }}>
       
       
        {program!==undefined && (<ProgramPageHeader program={program!} />)}
        
        
            <div style={{ padding: '30px' }}>
            <Row gutter={16}>
                {dates.map((item, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <Col span={6} key={`k${index}`}>
                      <Card title={item.title} bordered={false}>
                      <p>{item.date}</p>
                      </Card>
                  </Col>
                ))}
            </Row>
            </div>
 

      <div style={{ margin: '32px 0' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>{ t('app.levels.title') }</Title>
        <Row gutter={[24, 24]}>
          <Space>
          {program?.levels.map((item) => (<LevelItemCard key={item.id} level={item} program={program!} />))}
          </Space>
        </Row>
      </div>

    </Content>
  );
};

export default CourseProgramPage;



