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

// Define breakpoint (you can adjust this value)
const MOBILE_BREAKPOINT = 768; // pixels

export default function MyHeader() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const {menuList, selectedKeys, onClick} = routeToMenuHelperHook();
    // console.log(menuList)

    // --- Handle window resize ---
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
            // Close drawer if screen becomes larger while it's open
            if (window.innerWidth >= MOBILE_BREAKPOINT && drawerVisible) {
                setDrawerVisible(false);
            }
        };

        window.addEventListener('resize', handleResize);
        // Cleanup listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, [drawerVisible]); // Re-run effect if drawerVisible changes


    // --- Styles ---
    const headerStyle: React.CSSProperties = { 
        backgroundColor: '#f0f2f5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 15px', // Adjust padding slightly for mobile
        borderBottom: '1px solid #e8e8e8',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%', // Ensure header takes full width
    };

    const logoStyle: React.CSSProperties = {
        color: '#18a978',
        fontWeight: 'bold',
        fontSize: '1.5em',
        marginRight: '10px', // Add some space next to logo
    };

    const menuStyle: React.CSSProperties = {
        lineHeight: '64px', // Match Ant Design header height
        borderBottom: 'none',
        backgroundColor: 'transparent',
        flexGrow: 1, // Allow menu to take available space if needed
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
                {/* Left Section: Logo and Menu/Hamburger */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={logoStyle}>مبادراتي</div>
                    {!isMobile ? (
                        // Desktop Menu
                        <Menu
                            theme="light"
                            mode="horizontal"
                            style={menuStyle}
                            items={menuList}
                            onClick={onClick}
                            selectedKeys={selectedKeys} 
                        >
                           {/* {menuItems} */}
                        </Menu>
                    ) : (
                        // Mobile Hamburger Button (placed after logo)
                         <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={showDrawer}
                            style={{ marginLeft: 'auto' }} // Push hamburger to the right within its container if menu is hidden
                        />
                    )}
                </div>

                {/* Right Section: Search and Profile */}
                <Space align="center" size="middle"> {/* Use Space for better alignment and spacing */}
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="بحث"
                        style={{
                            width: isMobile ? 120 : 200, // Shrink search bar on mobile
                             borderRadius: '20px'
                        }}
                    />

                    {/* <AccountDropdown /> */}
                    <MyAccountDropdown />
                </Space>

            </Header>

            {/* Drawer for Mobile Menu */}
            {isMobile && (
                 <Drawer
                    title="القائمة" // Drawer Title
                    placement="right" // Or "left" depending on preference/RTL
                    closable={true}
                    onClose={closeDrawer}
                    open={drawerVisible}
                    styles={{ body: { padding: 0 } }} // Remove body padding to have menu flush
                 >
                    <Menu
                        mode="inline" // Vertical menu
                        defaultSelectedKeys={['courses']} 
                        items={menuList}
                        onClick={(key) => {
                            closeDrawer()
                            onClick(key)
                        }}
                        selectedKeys={selectedKeys} 
                     >
                         {/* {menuItems} */}
                     </Menu>
                </Drawer>
             )}
        </>
    );
}