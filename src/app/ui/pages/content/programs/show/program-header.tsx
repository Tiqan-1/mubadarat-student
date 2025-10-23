import type React from 'react';
import {
    Typography,
    Space,
    Row,
    Col,
    Tooltip,
    Modal,
    Button,
    Grid,
} from 'antd';
import {
    ClusterOutlined,
    PlayCircleOutlined,
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
import { useNavigate } from 'react-router';
import styles from '@/app/ui/components/ShineButton.module.css';

dayjs.locale('ar');

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

interface ProgramPageHeaderProps {
    program: Program | null | undefined;
}

const ProgramPageHeader: React.FC<ProgramPageHeaderProps> = ({ program }) => {
    const screens = useBreakpoint();
    
    if (!program) {
        return null;
    }

    const navigate = useNavigate();
    const navigateToCourses = () => {
        navigate(`/subscriptions/${program.subscriptionId}`);
    };

    const [modalOpen, setModalOpen] = useState(false);
    const handleCardClick = () => {
        setModalOpen(true);
    };

    const levelCount = program.levels?.length || 0;
    const totalTasks = program.levels?.reduce((sum, level) => sum + (level.tasks?.length || 0), 0) || 0;
    const totalLessons = program.levels?.reduce((sum, level) =>
        sum + (level.tasks?.reduce((taskSum, task) =>
            taskSum + (task.lessons?.length || 0), 0) || 0), 0) || 0;

    
    const programHeaderStyle: React.CSSProperties = {
        backgroundImage: 'linear-gradient(to right, #003d2b, #18a978)',
        padding: screens.md ? '24px 32px' : '16px', 
        borderRadius: '8px',
        color: '#fff',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        direction: 'rtl',
    };

    const buttonColStyle: React.CSSProperties = {
        textAlign: screens.md ? 'end' : 'start', // Align right on desktop, left on mobile
    };

    return (
        <div style={programHeaderStyle}>
            <SubscriptionModal program={program} open={modalOpen} setOpen={setModalOpen} msg={
                program.subscriptionId ? t('app.actions.confirm-unsubscription') : `
                    ${t('app.actions.confirm-subscription')}
                    ${program?.subscriptionFormUrl == null ? '' : "(سيظهر لك نموذج الإشتراك بعد التأكيد)"}
                `
            } />

            {/* Title and Subscribe Button */}
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col xs={24} md={18}>
                    <Title level={screens.md ? 2 : 3} style={{ color: '#fff', margin: 0 }}>
                        {program.name || "برنامج بدون عنوان"}
                    </Title>
                </Col>
                <Col xs={24} md={6} style={buttonColStyle}>
                    <Button 
                        key="subscribe" 
                        onClick={handleCardClick}
                        block={!screens.md} 
                        style={{ background: '#fff', color: program.subscriptionId ? '#e50d0d' : '#18a978', fontWeight: 'bold', border: 'none' }}
                    >
                        {program.subscriptionId ? 'إلغاء الإشتراك' : 'إشترك'}
                    </Button>
                </Col>
            </Row>

            {/* Description */}
            <Row style={{ marginTop: '16px' }}>
                <Col span={24}>
                    <Paragraph style={{ color: '#eee', marginBottom: 0 }} ellipsis={{ rows: 2, expandable: false }}>
                        {program.description || "لا يوجد وصف لهذا البرنامج."}
                    </Paragraph>
                </Col>
            </Row>

            {/* Stats and Continue Button */}
            <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24} md={18}>
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
                
                {program.subscriptionId &&
                    <Col xs={24} md={6} style={buttonColStyle}>
                        <Button
                            className={styles.shineButton}
                            onClick={navigateToCourses}
                            icon={<PlayCircleOutlined />}
                            // Make button full-width on mobile
                            block={!screens.md} 
                            style={{ background: '#fff', color: '#18a978', fontWeight: 'bold', border: 'none' }}
                        >
                            مواصلة الدراسة
                        </Button>
                    </Col>
                }
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
			return program.subscriptionId ? 
            subscriptionsApi.destroy( program.subscriptionId ) :  
            subscriptionsApi.create({programId: program.id});
		},
		onSuccess() {
      window.location.reload();
		},
	})
    
    const handleOk = () => {
        subscriptionAction.mutate()
      setModalText(program.subscriptionId ? t('app.actions.unsubscription is in progress') : t('app.actions.subscription is in progress'));
      if(!program.subscriptionId && program?.subscriptionFormUrl != null){
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
                danger={program.subscriptionId !== undefined}
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