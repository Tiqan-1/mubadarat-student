 
import { Layout, Typography, Row, Col } from 'antd';
import { useQuery } from '@tanstack/react-query'; 
import subjectsApi from "@/app/api/services/subjects";
import SubjectCard from './subject-card';
import { useNavigate } from 'react-router';
 

const {  Content } = Layout;
const { Title , Paragraph } = Typography;

const CourseProgramPage = () => { 
  const navigate = useNavigate()
  const {data:subjectsList} = useQuery({queryKey: ['subjects'], queryFn: () => subjectsApi.get({}), refetchOnWindowFocus:false}); 

    const welcomeSectionStyle: React.CSSProperties = {
        backgroundColor: '#e6f4ea', // Light green background from image
        padding: '60px 24px',
        textAlign: 'center',
        marginBottom: '32px',
        borderRadius: '8px', // Optional rounding
    };

  return (
    <Content style={{ padding: '0 48px', marginTop: '8px' }}>
       
            {/* --- Welcome Section --- */}
            <div style={welcomeSectionStyle}>
                <Title level={2} style={{ color: '#003d2b', marginBottom: '16px' }}>
                    مرحبا بك في مكتبة المواد المفتوحة
                </Title>
                <Paragraph style={{ fontSize: '1.1em', color: '#333' }}>
                تعرض هذه الصفحة المواد التعليمية المفتوحة التي يمكن للجميع الاستفادة منها ومتابعتها بشكل مستقل دون الحاجة إلى التسجيل في برنامج دراسي محدد.
                </Paragraph>
            </div>


      <div style={{ margin: '32px 0' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>المواد</Title>
        {/* <Row gutter={[24, 24]}>
          {subjectsList?.items.map((item) => (<SubjectItemCard key={item.id} item={item}/>))}
        </Row> */}
        <Row gutter={[16, 16]}>
          {subjectsList?.items.map((item) => (
            <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
              <SubjectCard key={item.id} subject={item} onClick={() => navigate(`/subjects/${item.id}`) }/>
            </Col>
          ))}
        </Row> 
      </div>

      

      {/* <div style={paginationContainerStyle}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={allSubjects.length}
                                onChange={handlePageChange}
                                showSizeChanger // Allow changing page size
                                pageSizeOptions={['8', '12', '16', '24']} // Common page size options
                                showTotal={(total, range) => `عرض ${range[0]}-${range[1]} من ${total} مادة`} // Customize total text
                            />
                        </div> */}

    </Content>
  );
};

export default CourseProgramPage;