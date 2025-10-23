 
import { Layout, Typography, Row, Col, Card, Tag } from 'antd';   
import { useQuery } from '@tanstack/react-query'; 
import ProgramPageHeader from './program-header';
import { useParams } from 'react-router';
import api from "@/app/api/services/programs";
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
    const program = programsList?.items.find((value) => value.id === id)
    
    const periods = [
      { title: 'فترة التسجيل', from: formatHeaderDate(program?.registrationStart), to: formatHeaderDate(program?.registrationEnd) },
      { title: "فترة البرنامج", from: formatHeaderDate(program?.start), to: formatHeaderDate(program?.end) }, 
    ];

  return (
    <Content style={{ padding: '0 48px', marginTop: '8px' }}>
       
       
        {program!==undefined && (<ProgramPageHeader program={program!} />)}
        
        
            <div style={{ padding: '30px' }}>
        <Row gutter={[24, 24]} >
                {periods.map((item, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <Col sm={24} md={12} key={`k${index}`}>
                      <Card title={item.title} bordered={false}>
                      <p>من
                          <Tag color="green">{item.from}</Tag>
                          إلى
                          <Tag color="red" style={{ marginRight: '5px' }}>{item.to}</Tag>
                      </p>
                      </Card>
                  </Col>
                ))}
            </Row>
            </div>
 

      <div style={{ margin: '32px 0' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>{ t('app.levels.title') }</Title>
        <Row gutter={[24, 24]} >
          {program?.levels.map((item, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <Col sm={24} md={12} key={`k${index}`}>
                <LevelItemCard key={item.id} level={item} program={program!} />
              </Col>
          ))}
        </Row>
      </div>

    </Content>
  );
};

export default CourseProgramPage;



