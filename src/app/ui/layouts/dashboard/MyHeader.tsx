import type React from 'react';
import { useState, useEffect } from 'react';
import {
    Layout,
    Menu,
    Input,
    Drawer,
    Button,
    Space  
} from 'antd';
import {
    SearchOutlined,
    MenuOutlined} from '@ant-design/icons';
import { routeToMenuHelperHook } from './nav/use-route-to-menu';
import MyAccountDropdown from '../components/my-account-dropdown'; 


const { Header } = Layout;


const MOBILE_BREAKPOINT = 768; 

export default function MyHeader() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const {menuList, selectedKeys, onClick} = routeToMenuHelperHook();

    
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
            
            if (window.innerWidth >= MOBILE_BREAKPOINT && drawerVisible) {
                setDrawerVisible(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [drawerVisible]);


    
    const headerStyle: React.CSSProperties = { 
        backgroundColor: '#f0f2f5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 15px',
        borderBottom: '1px solid #e8e8e8',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%',
    };

    const logoStyle: React.CSSProperties = {
        color: '#18a978',
        fontWeight: 'bold',
        fontSize: '1.5em',
        marginRight: '10px', 
    };

    const menuStyle: React.CSSProperties = {
        lineHeight: '64px', 
        borderBottom: 'none',
        backgroundColor: 'transparent',
        flexGrow: 1, 
    };
 

    const showDrawer = () => {
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    return (
        <>
            <Header style={headerStyle}>
                
                <div style={{ display: 'flex', alignItems: 'center', width:'100%' }}>
                    <div style={logoStyle}>مبادراتي</div>
                    {!isMobile ? (
                        
                        <Menu
                            theme="light"
                            mode="horizontal"
                            style={menuStyle}
                            items={menuList}
                            onClick={onClick}
                            selectedKeys={selectedKeys} 
                        >
                        </Menu>
                    ) : (
                        
                         <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={showDrawer}
                            style={{ marginLeft: 'auto' }}
                        />
                    )}
                </div>

                
                <Space align="center" size="middle"> 
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="بحث"
                        style={{
                            width: isMobile ? 120 : 200,
                             borderRadius: '20px'
                        }}
                    />

                    <MyAccountDropdown />
                </Space>

            </Header>

            {isMobile && (
                 <Drawer
                    title="القائمة" 
                    placement="right" 
                    closable={true}
                    onClose={closeDrawer}
                    open={drawerVisible}
                    styles={{ body: { padding: 0 } }} 
                 >
                    <Menu
                        mode="inline" 
                        defaultSelectedKeys={['courses']} 
                        items={menuList}
                        onClick={(key) => {
                            closeDrawer()
                            onClick(key)
                        }}
                        selectedKeys={selectedKeys} 
                     >
                         
                     </Menu>
                </Drawer>
             )}
        </>
    );
}