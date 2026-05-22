'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { createPortal } from 'react-dom';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { LucideIcon, PawPrint } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/context/auth-context';
import { useVetMode } from '@/context/vet-mode-context';
import {
	Stethoscope,
	Clock,
	Video,
	FlaskConical,
	Pill,
	Wallet,
	HeartPulse,
	Globe,
	Users,
	HelpCircle,
	Shield,
	FileText,
	Phone,
	User,
    Heart,
    HeartHandshake,
    MapPin,
    Activity,
    Sparkles,
    CalendarX
} from 'lucide-react';
import { getDoctors } from '@/lib/doctors-data';
import { useBookings, cancelFirestoreBooking } from '@/lib/bookingService';
import { motion, AnimatePresence } from 'framer-motion';

type LinkItem = {
	title: string;
	href: string;
	icon: LucideIcon;
	description?: string;
};

function NavbarAppointmentsList({ isMobile = false, closeMenu }: { isMobile?: boolean; closeMenu?: () => void }) {
	const { user } = useAuth();
	const { isVetMode } = useVetMode();
	const { bookings: appointments, loading } = useBookings(user?.id || user?.email, user?.role);

	const userApps = appointments;
	const doctors = getDoctors();

	const handleCancel = (appId: string) => {
		cancelFirestoreBooking(appId);
		// Local update immediately handled by Firestore snapshot listener
	};

	if (loading) {
		return <div className="text-center py-4 text-xs">Loading appointments...</div>;
	}

	if (userApps.length === 0) {
		return (
			<div className="text-center py-8 px-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
				<CalendarX className="w-8 h-8 text-gray-400 dark:text-zinc-600 mx-auto mb-2 animate-pulse" />
				<h4 className="text-xs font-bold text-gray-900 dark:text-white">No active appointments</h4>
				<p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
					Find a doctor or specialist near you to schedule your session today.
				</p>
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800", isMobile && "max-h-none")}>
			<AnimatePresence initial={false}>
				{userApps.map((app) => {
					const doctor = doctors.find(d => d.id === app.doctorId);
					if (!doctor) return null;

					const isVetDoc = doctor.id >= 100;
					const formattedDate = new Date(app.date).toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit'
					});

					return (
						<motion.div
							key={app.id}
							initial={{ opacity: 0, height: 0, y: -10 }}
							animate={{ opacity: 1, height: 'auto', y: 0 }}
							exit={{ opacity: 0, height: 0, y: 10 }}
							transition={{ duration: 0.2 }}
							className="bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-3 flex gap-3 items-center group relative overflow-hidden"
						>
							{/* Doctor Avatar */}
							<div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-200/50 dark:border-white/10">
								<img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
							</div>

							{/* Details */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-1.5 flex-wrap">
									<h4 className="text-[11px] font-black text-gray-900 dark:text-white truncate">
										{doctor.name}
									</h4>
									<span className={cn(
										"text-[7px] font-black uppercase tracking-wider px-1 py-0.5 rounded",
										isVetDoc 
											? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20"
											: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-500/20"
									)}>
										{isVetDoc ? "VET" : "MED"}
									</span>
								</div>
								<p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold truncate mt-0.5">{doctor.specialty}</p>
								<div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-gray-500 dark:text-zinc-400">
									<span className="truncate">{formattedDate}</span>
									<span className="shrink-0">•</span>
									<span className={cn(
										"font-extrabold uppercase tracking-wide",
										isVetMode ? "text-emerald-500" : "text-red-500"
									)}>
										{app.status}
									</span>
								</div>
							</div>

							{/* Cancel Action Button */}
							<button
								onClick={() => handleCancel(app.id)}
								title="Cancel Appointment"
								className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/15 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all shadow-sm"
							>
								<CalendarX className="w-3.5 h-3.5" />
							</button>
						</motion.div>
					);
				})}
			</AnimatePresence>
		</div>
	);
}

export function Header() {
	const [open, setOpen] = React.useState(false);
	const { user } = useAuth();
	const scrolled = useScroll(10);
	const { isVetMode, toggleVetMode } = useVetMode();

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	let productLinks: LinkItem[] = isVetMode ? [
		{
			title: 'Find Vets',
			href: '/find-doctors',
			description: 'Discover local veterinary & exotic pet experts',
			icon: Stethoscope,
		},
		{
			title: 'Live Queue Tracking',
			href: '/live-queue',
			description: 'Monitor your pet\'s position in real-time',
			icon: Clock,
		},
		{
			title: 'Vet Video Consult',
			href: '/video-consult',
			description: 'Instant veterinary tele-consults',
			icon: Video,
		},
		{
			title: 'Pet Lab Tests',
			href: '/lab-tests',
			description: 'Book at-home pet sample collection',
			icon: FlaskConical,
		},
		{
			title: 'Pet Pharmacy',
			href: '/medicines',
			description: 'Dewormers, tick meds & supplements',
			icon: Pill,
		},
		{
			title: 'My Wallet',
			href: '/wallet',
			description: 'Manage balance and quick top-ups',
			icon: Wallet,
		},
	] : [
		{
			title: 'Find Doctors',
			href: '/find-doctors',
			description: 'Discover local & rural experts',
			icon: Stethoscope,
		},
		{
			title: 'Live Queue Tracking',
			href: '/live-queue',
			description: 'Monitor your position in real-time',
			icon: Clock,
		},
		{
			title: 'Video Consult',
			href: '/video-consult',
			description: 'Instant tele-medicine calls',
			icon: Video,
		},
		{
			title: 'Lab Tests',
			href: '/lab-tests',
			description: 'Book at-home collection',
			icon: FlaskConical,
		},
		{
			title: 'Medicines',
			href: '/medicines',
			description: 'Order from verified local pharmacies',
			icon: Pill,
		},
		{
			title: 'My Wallet',
			href: '/wallet',
			description: 'Manage balance and quick top-ups',
			icon: Wallet,
		},
	];

	if (user?.role === "patient") {
		productLinks = [
			...productLinks,
			{
				title: 'AI Assistant',
				href: '/ai-assistant',
				description: 'Check symptoms & get medicine schedules',
				icon: Sparkles,
			}
		];
	}

	const companyLinks: LinkItem[] = [
		{
			title: 'Knowledge Base',
			href: '/knowledge-base',
			description: 'Guides, articles and FAQs',
			icon: HelpCircle,
		},
		{
			title: 'Community Forum',
			href: '/community',
			description: 'Ask questions and discuss',
			icon: Users,
		},
		{
			title: 'System Status',
			href: '/system-status',
			icon: Globe,
			description: 'Real-time platform updates',
		},
	];

	const companyLinks2: LinkItem[] = isVetMode ? [
		{
			title: 'Join as Veterinarian',
			href: '/join-doctor',
			icon: Users,
		},
		{
			title: 'Partner Labs',
			href: '/partner-labs',
			icon: Shield,
		},
		{
			title: 'Contact Support',
			href: '/contact-support',
			icon: Phone,
		}
	] : [
		{
			title: 'Join as Doctor',
			href: '/join-doctor',
			icon: Users,
		},
		{
			title: 'Partner Labs',
			href: '/partner-labs',
			icon: Shield,
		},
		{
			title: 'Contact Support',
			href: '/contact-support',
			icon: Phone,
		}
	];

	const filteredCompanyLinks2 = companyLinks2.filter((item) => {
		if (user?.role === "patient") {
			return item.title !== "Join as Doctor" && item.title !== "Join as Veterinarian" && item.title !== "Partner Labs";
		}
		if (user?.role === "doctor") {
			return item.title !== "Join as Doctor" && item.title !== "Join as Veterinarian";
		}
		return true;
	});

	const socialLinks: LinkItem[] = isVetMode ? [
		{
			title: 'Stray Welfare & NGO',
			href: '/ngo-support',
			description: 'Free checkups for stray animals',
			icon: Heart,
		},
		{
			title: 'Donate to Shelters',
			href: '/donate',
			description: 'Fund treatments for rescue pets',
			icon: HeartHandshake,
		},
		{
			title: 'Free Rabies Camps',
			href: '/health-camps',
			description: 'Locate free pet health drives near you',
			icon: MapPin,
		},
	] : [
		{
			title: 'NGO Support',
			href: '/ngo-support',
			description: 'Free checkups for children',
			icon: Heart,
		},
		{
			title: 'Donate',
			href: '/donate',
			description: 'Fund treatments for patients',
			icon: HeartHandshake,
		},
		{
			title: 'Health Camps',
			href: '/health-camps',
			description: 'Locate free camps near you',
			icon: MapPin,
		},
	];

	const LogoIcon = user?.role === "ngo" ? HeartHandshake : (isVetMode ? PawPrint : HeartPulse);
	const logoTextColor = user?.role === "ngo" ? "text-purple-600 dark:text-purple-500" : (isVetMode ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500");
	const logoText = user?.role === "ngo" ? "WeCare NGO" : (isVetMode ? "WeCare Vet" : "WeCare");

	return (
		<header
			className={cn('sticky top-0 z-50 w-full border-b border-transparent transition-all duration-300', {
				'bg-white/80 dark:bg-black/80 supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/60 border-gray-200 dark:border-white/10 backdrop-blur-md shadow-sm dark:shadow-none':
					scrolled,
			})}
		>
			<nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
				<div className="flex items-center gap-5">
					<Link to="/" className="hover:bg-gray-100/50 dark:hover:bg-white/10 rounded-md p-2 flex items-center gap-2 group transition-colors">
						<LogoIcon className={cn("h-6 w-6 group-hover:scale-110 transition-transform", logoTextColor)} />
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">{logoText}</span>
					</Link>
					<NavigationMenu className="hidden md:flex ml-4">
						<NavigationMenuList>
							{(!user || (user.role !== "doctor" && user.role !== "ngo")) && (
								<NavigationMenuItem>
									<NavigationMenuTrigger className={cn("bg-transparent font-bold focus:text-red-500 data-[state=open]:text-red-500 transition-colors drop-shadow-sm text-gray-900 dark:text-white", isVetMode ? "hover:text-emerald-500 dark:hover:text-emerald-400 focus:text-emerald-500 data-[state=open]:text-emerald-500" : "hover:text-red-500 dark:hover:text-red-400")}>Services</NavigationMenuTrigger>
									<NavigationMenuContent className="bg-white dark:bg-black/90 dark:backdrop-blur-xl p-1 pr-1.5 border border-gray-200 dark:border-white/10 shadow-xl rounded-xl">
										<ul className="grid w-[600px] grid-cols-2 gap-2 rounded-md p-2">
											{productLinks.map((item, i) => (
												<li key={i}>
													<ListItem {...item} />
												</li>
											))}
										</ul>
									</NavigationMenuContent>
								</NavigationMenuItem>
							)}
							{user && user.role !== "doctor" && (
								<NavigationMenuItem>
									<NavigationMenuTrigger className={cn("bg-transparent font-bold focus:text-red-500 data-[state=open]:text-red-500 transition-colors drop-shadow-sm text-gray-900 dark:text-white", isVetMode ? "hover:text-emerald-500 dark:hover:text-emerald-400 focus:text-emerald-500 data-[state=open]:text-emerald-500" : "hover:text-red-500 dark:hover:text-red-400")}>
										Appointments
									</NavigationMenuTrigger>
									<NavigationMenuContent className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl p-4 w-[360px] md:w-[400px]">
										<div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-2 mb-3">
											<span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-wider">Active Bookings</span>
											<span className={cn(
												"text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
												isVetMode ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
											)}>Verified Live</span>
										</div>
										<NavbarAppointmentsList />
									</NavigationMenuContent>
								</NavigationMenuItem>
							)}
							<NavigationMenuItem>
								<NavigationMenuTrigger className={cn("bg-transparent font-bold focus:text-red-500 data-[state=open]:text-red-500 transition-colors drop-shadow-sm text-gray-900 dark:text-white", isVetMode ? "hover:text-emerald-500 dark:hover:text-emerald-400 focus:text-emerald-500 data-[state=open]:text-emerald-500" : "hover:text-red-500 dark:hover:text-red-400")}>Ecosystem</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-white dark:bg-black/90 dark:backdrop-blur-xl p-1 pr-1.5 pb-1.5 border border-gray-200 dark:border-white/10 shadow-xl rounded-xl">
									<div className="grid w-[600px] grid-cols-2 gap-2">
										<ul className="space-y-2 rounded-md p-2 border-r border-gray-100 dark:border-white/10">
											{companyLinks.map((item, i) => (
												<li key={i}>
													<ListItem {...item} />
												</li>
											))}
										</ul>
										<ul className="space-y-2 p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
											{filteredCompanyLinks2.map((item, i) => (
												<li key={i}>
													<NavigationMenuLink
														asChild
													>
                            <Link to={item.href || '#'} className={cn("flex p-2 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm dark:hover:shadow-none transition-all rounded-md items-center gap-x-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white", isVetMode ? "hover:text-emerald-500" : "hover:text-red-500")}>
														  <item.icon className="size-4" />
														  <span className="font-medium text-sm">{item.title}</span>
                            </Link>
													</NavigationMenuLink>
												</li>
											))}
										</ul>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuTrigger className={cn("bg-transparent font-bold focus:text-red-500 data-[state=open]:text-red-500 transition-colors drop-shadow-sm text-gray-900 dark:text-white", isVetMode ? "hover:text-emerald-500 dark:hover:text-emerald-400 focus:text-emerald-500 data-[state=open]:text-emerald-500" : "hover:text-red-500 dark:hover:text-red-400")}>Social Impact</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-white dark:bg-black/90 dark:backdrop-blur-xl p-1 pr-1.5 border border-gray-200 dark:border-white/10 shadow-xl rounded-xl">
									<ul className="grid w-[400px] grid-cols-1 gap-2 rounded-md p-2">
										{socialLinks.map((item, i) => (
											<li key={i}>
												<ListItem {...item} />
											</li>
										))}
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
							{user?.role === "ngo" && (
								<NavigationMenuItem>
									<Link 
										to="/ai-assistant" 
										className={cn(
											"bg-transparent font-bold transition-all duration-300 drop-shadow-sm text-gray-900 dark:text-white px-4 py-2 hover:bg-gray-100/50 dark:hover:bg-white/10 rounded-md flex items-center gap-1.5 text-sm", 
											isVetMode ? "hover:text-emerald-500 dark:hover:text-emerald-400" : "hover:text-purple-500 dark:hover:text-purple-400"
										)}
									>
										<Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400 animate-pulse" />
										AI Assistant
									</Link>
								</NavigationMenuItem>
							)}
							{(!user || (user.role !== "doctor" && user.role !== "ngo")) && (
								<NavigationMenuItem>
									<div 
										onClick={toggleVetMode}
										className="px-4 py-2 ml-2 flex items-center gap-2 rounded-full font-medium text-sm border cursor-pointer transition-colors backdrop-blur-md bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/20 select-none"
									>
										<span className={cn("transition-colors", !isVetMode ? "text-red-600 font-extrabold" : "text-gray-500 dark:text-gray-400")}>Human Mode</span>
										<div className={cn("w-8 h-4 rounded-full relative transition-colors duration-300", isVetMode ? "bg-emerald-500" : "bg-red-500")}>
											<div className={cn("absolute top-0.5 w-3 h-3 bg-white dark:bg-gray-100 rounded-full transition-all duration-300", isVetMode ? "left-4.5" : "left-0.5")}></div>
										</div>
										<span className={cn("transition-colors", isVetMode ? "text-emerald-600 font-extrabold" : "text-gray-500 dark:text-gray-400")}>Vet Mode</span>
									</div>
								</NavigationMenuItem>
							)}
						</NavigationMenuList>
					</NavigationMenu>
				</div>
				<div className="hidden items-center gap-3 md:flex">
          <div className="rounded-full backdrop-blur-md transition-colors">
            <ThemeToggle />
          </div>
					{user ? (
						<>
							{user.role === 'doctor' && (
								<Button variant="ghost" asChild className={cn("font-bold drop-shadow-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 gap-2", isVetMode ? "hover:text-emerald-600 dark:hover:text-emerald-400" : "hover:text-red-600 dark:hover:text-red-400")}>
									<Link to="/doctor-dashboard" className="flex items-center gap-1.5">
										<Activity className="w-4 h-4" />
										Dashboard
									</Link>
								</Button>
							)}
							{user.role === 'ngo' && (
								<Button variant="ghost" asChild className={cn("font-bold drop-shadow-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 gap-2", isVetMode ? "hover:text-emerald-600 dark:hover:text-emerald-400" : "hover:text-violet-600 dark:hover:text-violet-400")}>
									<Link to="/ngo-dashboard" className="flex items-center gap-1.5">
										<Activity className="w-4 h-4" />
										NGO Dashboard
									</Link>
								</Button>
							)}
							<Button variant="ghost" asChild className={cn("font-bold drop-shadow-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 gap-2", isVetMode ? "hover:text-emerald-600 dark:hover:text-emerald-400" : "hover:text-red-600 dark:hover:text-red-400")}>
								<Link to="/profile">
									<div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
										{user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
									</div>
									Profile
								</Link>
							</Button>
						</>
					) : (
						<Button variant="ghost" asChild className={cn("font-bold drop-shadow-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10", isVetMode ? "hover:text-emerald-600 dark:hover:text-emerald-400" : "hover:text-red-600 dark:hover:text-red-400")}>
							<Link to="/login">Login</Link>
						</Button>
					)}
					{(!user || user.role !== "ngo") && (
						<Button className={cn("text-white shadow-md rounded-full px-6 transition-all duration-300", isVetMode ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 hover:shadow-emerald-500/30" : "bg-red-600 hover:bg-red-700 shadow-red-500/20 hover:shadow-red-500/30")}>Wallet: ₹5,000</Button>
					)}
				</div>
				<div className="flex items-center gap-2 md:hidden">
          <div className="rounded-full backdrop-blur-md transition-colors">
            <ThemeToggle />
          </div>
				  <Button
				  	size="icon"
				  	variant="ghost"
				  	onClick={() => setOpen(!open)}
				  	className="hover:bg-gray-100/50 dark:hover:bg-white/10 text-gray-900 dark:text-white"
				  	aria-expanded={open}
				  	aria-controls="mobile-menu"
				  	aria-label="Toggle menu"
				  >
				  	<MenuToggleIcon open={open} className="size-6" duration={300} />
				  </Button>
        </div>
			</nav>
			<MobileMenu open={open} className="flex flex-col justify-between gap-4 overflow-y-auto bg-white/95 dark:bg-black/95">
				<NavigationMenu className="max-w-full">
					<div className="flex w-full flex-col gap-y-4 pt-6">
						{(!user || (user.role !== "doctor" && user.role !== "ngo")) && (
							<>
								<span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2">Services</span>
								<div className="grid grid-cols-1 gap-2">
									{productLinks.map((link) => (
										<ListItem key={link.title} {...link} />
									))}
								</div>
							</>
						)}
						{user && user.role !== "doctor" && (
							<>
								<span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mt-2">Active Appointments</span>
								<div className="px-2 mt-2">
									<NavbarAppointmentsList isMobile closeMenu={() => setOpen(false)} />
								</div>
							</>
						)}
						{user?.role === "ngo" && (
							<>
								<span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mt-4">AI Assistant</span>
								<div className="px-2 mt-2">
									<Link 
										to="/ai-assistant" 
										onClick={() => setOpen(false)}
										className={cn(
											"flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 transition-all text-sm font-bold hover:bg-gray-100 dark:hover:bg-white/10",
											isVetMode ? "text-emerald-600 dark:text-emerald-400" : "text-violet-600 dark:text-violet-400"
										)}
									>
										<Sparkles className="w-5 h-5 text-purple-500 shrink-0" />
										<span>AI Assistant Chatbot</span>
									</Link>
								</div>
							</>
						)}
						<span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mt-4">Ecosystem</span>
						<div className="grid grid-cols-1 gap-2">
               {companyLinks.map((link) => (
                 <ListItem key={link.title} {...link} />
               ))}
               {filteredCompanyLinks2.map((link) => (
                 <ListItem key={link.title} {...link} />
               ))}
            </div>
						<span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mt-4">Social Impact</span>
						<div className="grid grid-cols-1 gap-2">
							{socialLinks.map((link) => (
								<ListItem key={link.title} {...link} />
							))}
						</div>
					</div>
				</NavigationMenu>
				<div className="flex flex-col gap-3 pb-8">
					{user ? (
						<>
							{user.role === 'doctor' && (
								<Button variant="outline" asChild className="w-full bg-white dark:bg-transparent text-gray-900 dark:text-white border-gray-300 dark:border-white/20">
									<Link to="/doctor-dashboard" onClick={() => setOpen(false)}>Doctor Dashboard</Link>
								</Button>
							)}
							{user.role === 'ngo' && (
								<Button variant="outline" asChild className="w-full bg-white dark:bg-transparent text-gray-900 dark:text-white border-gray-300 dark:border-white/20">
									<Link to="/ngo-dashboard" onClick={() => setOpen(false)}>NGO Dashboard</Link>
								</Button>
							)}
							<Button variant="outline" asChild className="w-full bg-white dark:bg-transparent text-gray-900 dark:text-white border-gray-300 dark:border-white/20">
								<Link to="/profile" onClick={() => setOpen(false)}>My Profile</Link>
							</Button>
						</>
					) : (
						<Button variant="outline" asChild className="w-full bg-white dark:bg-transparent text-gray-900 dark:text-white border-gray-300 dark:border-white/20">
							<Link to="/login" onClick={() => setOpen(false)}>Login / Register</Link>
						</Button>
					)}
					{(!user || user.role !== "ngo") && (
						<Button className={cn("w-full text-white", isVetMode ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700")} onClick={() => { setOpen(false); }}>My Wallet</Button>
					)}
				</div>
			</MobileMenu>
		</header>
	);
}

type MobileMenuProps = React.ComponentProps<'div'> & {
	open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
	if (!open || typeof window === 'undefined') return null;

	return createPortal(
		<div
			id="mobile-menu"
			className={cn(
				'bg-white/95 supports-[backdrop-filter]:bg-white/80 backdrop-blur-xl',
				'fixed top-16 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-t border-gray-100 md:hidden',
			)}
		>
			<div
				data-slot={open ? 'open' : 'closed'}
				className={cn(
					'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 ease-out duration-200',
					'size-full p-6',
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}

function ListItem({
	title,
	description,
	icon: Icon,
	className,
	href,
	...props
}: React.ComponentProps<typeof NavigationMenuLink> & LinkItem) {
	const { isVetMode } = useVetMode();
	return (
		<NavigationMenuLink className={cn('w-full flex flex-row gap-x-4 hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 rounded-xl p-3 transition-colors', className)} {...props} asChild>
			<Link to={href || '#'}>
				<div className={cn(
					"flex aspect-square size-12 items-center justify-center rounded-lg border shadow-sm shrink-0",
					isVetMode
						? "bg-emerald-50 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-white/5"
						: "bg-red-50 dark:bg-white/10 text-red-600 dark:text-red-400 border-red-100 dark:border-white/5"
				)}>
					<Icon className="size-5" />
				</div>
				<div className="flex flex-col items-start justify-center">
					<span className="font-bold text-gray-900 dark:text-gray-200 text-sm">{title}</span>
					<span className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 line-clamp-1">{description}</span>
				</div>
			</Link>
		</NavigationMenuLink>
	);
}

const productLinks: LinkItem[] = [
	{
		title: 'Find Doctors',
		href: '/find-doctors',
		description: 'Discover local & rural experts',
		icon: Stethoscope,
	},
	{
		title: 'Live Queue Tracking',
		href: '/live-queue',
		description: 'Monitor your position in real-time',
		icon: Clock,
	},
	{
		title: 'Video Consult',
		href: '/video-consult',
		description: 'Instant tele-medicine calls',
		icon: Video,
	},
	{
		title: 'Lab Tests',
		href: '/lab-tests',
		description: 'Book at-home collection',
		icon: FlaskConical,
	},
	{
		title: 'Medicines',
		href: '/medicines',
		description: 'Order from verified local pharmacies',
		icon: Pill,
	},
	{
		title: 'My Wallet',
		href: '/wallet',
		description: 'Manage balance and quick top-ups',
		icon: Wallet,
	},
];

const companyLinks: LinkItem[] = [
	{
		title: 'Knowledge Base',
		href: '/knowledge-base',
		description: 'Guides, articles and FAQs',
		icon: HelpCircle,
	},
	{
		title: 'Community Forum',
		href: '/community',
		description: 'Ask questions and discuss',
		icon: Users,
	},
	{
		title: 'System Status',
		href: '/system-status',
		icon: Globe,
		description: 'Real-time platform updates',
	},
];

const companyLinks2: LinkItem[] = [
	{
		title: 'Join as Doctor',
		href: '/join-doctor',
		icon: Users,
	},
	{
		title: 'Partner Labs',
		href: '/partner-labs',
		icon: Shield,
	},
	{
		title: 'Contact Support',
		href: '/contact-support',
		icon: Phone,
	}
];

const socialLinks: LinkItem[] = [
	{
		title: 'NGO Support',
		href: '/ngo-support',
		description: 'Free checkups for children',
		icon: Heart,
	},
	{
		title: 'Donate',
		href: '/donate',
		description: 'Fund treatments for patients',
		icon: HeartHandshake,
	},
	{
		title: 'Health Camps',
		href: '/health-camps',
		description: 'Locate free camps near you',
		icon: MapPin,
	},
];


function useScroll(threshold: number) {
	const [scrolled, setScrolled] = React.useState(false);

	const onScroll = React.useCallback(() => {
		setScrolled(window.scrollY > threshold);
	}, [threshold]);

	React.useEffect(() => {
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, [onScroll]);

	React.useEffect(() => {
		onScroll();
	}, [onScroll]);

	return scrolled;
}
