 
import { Layout, Typography, Row, Space } from 'antd';   
import { useQuery } from '@tanstack/react-query'; 
import ProgramPageHeader from './program-header';
import { useParams } from 'react-router';
import api from "@/app/api/services/programs";
import subscriptionsApi from "@/app/api/services/subscriptions";
import LevelItemCard from './level-item-card';
import { t } from 'i18next';
 

const {  Content } = Layout;
const { Title  } = Typography;

const CourseProgramPage = () => { 
	const { id } = useParams(); 
    const {data:programsList} = useQuery({queryKey: ['programs', id], queryFn: () => api.getOpen({id:id}), refetchOnWindowFocus:false});
    const {data:subscriptionsList} = useQuery({queryKey: ['subscriptions', id], queryFn: () => subscriptionsApi.get({programId:id}), refetchOnWindowFocus:false});
    const program = programsList?.items.find((value) => value.id === id)
    
    const subscriptions = subscriptionsList?.items ?? []; 
    if(subscriptions.length > 0){
      for (const element of program?.levels ?? []) {
        element.isSubscribed = (subscriptions.filter((value) => value.level.id === element.id).length ?? 0) > 0;
        console.log('isSubscribed', element.isSubscribed);
      }
    }
    // console.log('program', program);
    // console.log('programs', programsList?.items.length);
  

  return (
    <Content style={{ padding: '0 48px', marginTop: '8px' }}>
       
       
        {program!==undefined && (<ProgramPageHeader program={program!} />)}
 

      <div style={{ margin: '32px 0' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>{ t('app.levels.title') }</Title>
        <Row gutter={[24, 24]}>
          <Space>
          {program?.levels.map((item) => (<LevelItemCard key={item.id} level={item} />))}
          </Space>
        </Row>
      </div>

    </Content>
  );
};

export default CourseProgramPage;



