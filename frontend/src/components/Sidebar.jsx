import React, { useState, createContext, useContext, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
  isMobile = false,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
  isMobile,
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate} isMobile={isMobile}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = ({ className, children, mobileOpen, setMobileOpen, ...props }) => {
  return (
    <>
      <DesktopSidebar className={className} {...props}>
        {children}
      </DesktopSidebar>
      <MobileSidebar className={className} open={mobileOpen} setOpen={setMobileOpen} {...props}>
        {children}
      </MobileSidebar>
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-screen px-4 py-4 hidden md:flex md:flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 w-[280px] flex-shrink-0 sticky top-0 left-0 overflow-hidden z-50",
        className
      )}
      animate={{
        width: animate ? (open ? "280px" : "84px") : "280px",
      }}
      transition={{
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1] // Custom ease out quint for smoother motion
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      <div className="flex flex-col h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  open,
  setOpen,
  ...props
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[150] md:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-slate-900 z-[160] md:hidden p-6 flex flex-col shadow-2xl overflow-hidden",
              className
            )}
          >
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="" className="w-8 h-8" />
                    <span className="font-black text-xl text-slate-900 dark:text-white">Steamline</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-200 transition-colors">
                    <X size={20} />
                </button>
            </div>
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                <SidebarProvider isMobile={true} open={true}>
                    {children}
                </SidebarProvider>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const SidebarLink = ({
  link,
  className,
  onClick,
  isMobile: isMobileProp,
  ...props
}) => {
  const { open, animate, isMobile: isMobileContext } = useSidebar();
  const location = useLocation();
  const isActive = location.pathname === link.href;
  const showText = isMobileProp || isMobileContext || open;

  return (
    <NavLink
      to={link.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 group/sidebar py-3 px-3 rounded-2xl transition-colors duration-200",
        isActive 
            ? "bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none" 
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
        className
      )}
      {...props}
    >
      <div className={cn("flex-shrink-0 flex items-center justify-center w-6 h-6 transition-all duration-300", isActive ? "text-white" : "text-slate-400 group-hover/sidebar:text-orange-600 group-hover/sidebar:scale-110")}>
        {React.cloneElement(link.icon, { size: 20, strokeWidth: isActive ? 2.5 : 2 })}
      </div>
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
            {showText && (
            <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-bold whitespace-nowrap inline-block ml-1"
            >
                {link.label}
            </motion.span>
            )}
        </AnimatePresence>
      </div>
    </NavLink>
  );
};

const SidebarMain = ({ menuItems, mobileOpen, setMobileOpen }) => {
    const { logout } = useAuth();
    const [open, setOpen] = useState(false);

    const adjustedMenuItems = menuItems.map(item => ({
        ...item,
        href: `/app${item.href}`
    }));

    return (
        <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody 
                className="justify-between" 
                mobileOpen={mobileOpen} 
                setMobileOpen={setMobileOpen}
            >
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="mb-10 hidden md:flex items-center h-10 overflow-hidden">
                        <Logo open={open} />
                    </div>
                    <div className="flex flex-col gap-1.5 px-0">
                        {adjustedMenuItems.map((link, idx) => (
                            <SidebarLink key={idx} link={link} onClick={() => setMobileOpen(false)} />
                        ))}
                    </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-auto">
                    <button 
                        onClick={logout}
                        className={cn(
                            "flex items-center w-full py-3 px-3 rounded-2xl text-red-600 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all font-black overflow-hidden shadow-sm",
                            open ? "justify-start" : "justify-center"
                        )}
                    >
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                            <LogOut size={20} />
                        </div>
                        <AnimatePresence>
                            {(mobileOpen || open) && (
                                <motion.span 
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="text-sm whitespace-nowrap ml-3"
                                >
                                    Sign Out
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </SidebarBody>
        </Sidebar>
    );
};

const Logo = ({ open }) => {
    return (
        <Link to="/app/dashboard" className={cn("flex items-center overflow-hidden transition-all duration-300 py-2", open ? "px-2 gap-3" : "px-0 w-full justify-center")}>
            <img src="/logo.png" alt="Steamline Logo" className="w-10 h-10 object-contain flex-shrink-0" />
            <AnimatePresence>
                {open && (
                    <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-xl font-black tracking-tight text-slate-900 dark:text-white"
                    >
                        Steamline
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    );
};

export default SidebarMain;