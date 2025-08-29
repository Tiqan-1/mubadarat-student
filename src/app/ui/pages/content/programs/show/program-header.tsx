import type React from 'react';
import {
    Typography,
    Space,
    Row,
    Col,
    Tooltip,
    Modal,
    Button} from 'antd';
import {
    ClusterOutlined,
    UnorderedListOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import type { Program } from '@/app/api/services/programs';
import subscriptionsApi from "@/app/api/services/subscriptions";
import { t } from 'i18next';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

dayjs.locale('ar');

const { Title, Text, Paragraph } = Typography;

interface ProgramPageHeaderProps {
    program: Program | null | undefined;
}


const ProgramPageHeader: React.FC<ProgramPageHeaderProps> = ({ program }) => {
    if (!program) {
        // Optional: Render a loading skeleton or null
        return null;
    }

    
    const [modalOpen, setModalOpen] = useState(false);
    const handleCardClick = () => {
      setModalOpen(true);
    };

    // Calculate overview numbers safely
    const levelCount = program.levels?.length || 0;
    const totalTasks = program.levels?.reduce((sum, level) => sum + (level.tasks?.length || 0), 0) || 0;
    const totalLessons = program.levels?.reduce((sum, level) =>
        sum + (level.tasks?.reduce((taskSum, task) =>
            taskSum + (task.lessons?.length || 0), 0) || 0), 0) || 0;


    // Style for the container
    const programHeaderStyle: React.CSSProperties = {
        // backgroundColor: '#003d2b', // Darker Green Background
        backgroundImage: 'linear-gradient(to right, #003d2b, #18a978)',
        padding: '24px 32px', // Increased padding
        borderRadius: '8px',
        color: '#fff',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        direction: 'rtl',
    }; 
    return (
        <div style={programHeaderStyle}>
            <SubscriptionModal program={program} open={modalOpen} setOpen={setModalOpen}  msg={
                                    program.isSubscribed ? t('app.actions.confirm-unsubscription') : `
                        ${t('app.actions.confirm-subscription')}
                        ${program?.subscriptionFormUrl==null ? '': "(سيظهر لك نموذج الإشتراك بعد التأكيد)"}
                        `
            } />
            <Row justify="space-between" align="top" gutter={[16, 8]}>
              <Col flex="auto">
                    <Title level={2} style={{ color: '#fff', margin: '0 0 8px 0' }}>
                        {program.name || "برنامج بدون عنوان"}
                    </Title>
              </Col>
              <Col flex="auto" style={{textAlign: 'end'}}>
                    <Button key="subscribe" size="large" onClick={handleCardClick} 
                                style={{ background: '#fff', color: program.isSubscribed ? '#e50d0d':'#18a978', fontWeight: 'bold', border: 'none' }}
                                >
                        {program.isSubscribed ? 'إلغاء الإشتراك': 'إشترك'} 
                    </Button>
              </Col>
            </Row>

            <Row justify="space-between" align="top" gutter={[16, 8]}>
              <Col flex="auto">
                    <Paragraph style={{ color: '#eee', marginBottom: '16px' }} ellipsis={{ rows: 2, expandable: false }}>
                        {program.description || "لا يوجد وصف لهذا البرنامج."}
                    </Paragraph>
              </Col>
            </Row>

            <Row justify="space-between" align="top" gutter={[16, 8]}>
              <Col flex="auto">
                    <Space size="large" wrap>
                        <Tooltip title="عدد المستويات">
                            <Space> <ClusterOutlined /> <Text style={{ color: '#fff' }}>{levelCount} مستويات</Text> </Space>
                        </Tooltip>
                         <Tooltip title="إجمالي عدد المهام">
                            <Space> <UnorderedListOutlined /> <Text style={{ color: '#fff' }}>{totalTasks} مهام</Text> </Space>
                        </Tooltip>
                        <Tooltip title="إجمالي عدد الدروس">
                             <Space> <VideoCameraOutlined /> <Text style={{ color: '#fff' }}>{totalLessons} دروس</Text> </Space>
                        </Tooltip>
                    </Space>
              </Col>
            </Row>


        </div>
    );
};

export default ProgramPageHeader;

function SubscriptionModal({ msg, program, open, setOpen}: { msg:string, program:Program, open:boolean, setOpen: Dispatch<SetStateAction<boolean>>}) {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState(msg);
    const subscriptionAction = useMutation({
		mutationFn: () => {
			return program.isSubscribed ? 
            subscriptionsApi.destroy( program.id ) :  
            subscriptionsApi.create({programId: program.id});
		},
		onSuccess() { 
		},
	})
    
    const handleOk = () => {
        subscriptionAction.mutate()
      setModalText(program.isSubscribed ? t('app.actions.unsubscription is in progress') : t('app.actions.subscription is in progress'));
      if(!program.isSubscribed && program?.subscriptionFormUrl != null){
            window.open(program?.subscriptionFormUrl, "_blank")
      }
      setConfirmLoading(true);
      setTimeout(() => {
        setOpen(false);
        setConfirmLoading(false);
      }, 2000);
    };
  
    const handleCancel = () => {
      console.log('Clicked cancel button');
      setOpen(false);
    };
  
    return ( 
        <Modal
          key={`modal${program.id}`}
          title={modalText}
          open={open}
          onOk={handleOk}
          footer={[
            <Button key="back" onClick={handleCancel}>
            {t('common.close')} 
            </Button>,
            <Button key="submit" 
                danger={program.isSubscribed}
                type="primary"
                loading={subscriptionAction.isPending} 
                onClick={handleOk}>
            {t('common.confirm')} 
            </Button>
          ]}
          confirmLoading={confirmLoading}
          onCancel={handleCancel}
        >
          <p>{program.name}</p>
        </Modal> 
    );
  };