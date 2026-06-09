'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from '@/components/ProgressBar';
import { AdminStats } from '@/types';
// Remove static import
// import ExcelJS from 'exceljs';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// --- Premium Icons ---
const Icons = {
    Dashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
    ),
    Donations: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
    ),
    Campaign: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
    ),
    Chart: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
    ),
    History: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="10"></circle></svg>
    ),
    Admins: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    ),
    Logout: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
    ),
    Shield: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    )
};

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasUnsavedCards, setHasUnsavedCards] = useState(false);
    const [donationCards, setDonationCards] = useState<any[]>([
        { id: 'melaveh-malkah', name: 'Melaveh Malkah', description: 'Saturday night gathering', emoji: '🌙', price: 180, slug: 'melaveh-malkah', is_sponsored: false, sponsored_label: '', sponsor_name: '' },
        { id: 'kiddush', name: 'Kiddush', description: 'Shabbat refreshments', emoji: '🍷', price: 100, slug: 'kiddush', is_sponsored: false, sponsored_label: '', sponsor_name: '' },
        { id: 'seudah-shlishit', name: 'Seudah Shlishit', description: 'Third Shabbat meal', emoji: '🥖', price: 50, slug: 'seudah-shlishit', is_sponsored: false, sponsored_label: '', sponsor_name: '' },
        { id: 'transportation', name: 'Transportation', description: 'Travel costs', emoji: '🚌', price: 200, slug: 'transportation', is_sponsored: false, sponsored_label: '', sponsor_name: '' },
        { id: 'activities', name: 'Activities', description: 'Programs & activities', emoji: '🎯', price: 150, slug: 'activities', is_sponsored: false, sponsored_label: '', sponsor_name: '' },
        { id: 'general', name: 'General Support', description: 'Flexible donation', emoji: '💝', price: 50, slug: 'general', is_sponsored: false, sponsored_label: '', sponsor_name: '' },
    ]);
    const [email, setEmail] = useState('carribeanpalm72@gmail.com');
    const [password, setPassword] = useState('1q2w3e4r');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState('');
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [winner, setWinner] = useState<{ name: string; email: string; amount: number } | null>(null);
    const [newPrize, setNewPrize] = useState('');
    const [newGoal, setNewGoal] = useState('');
    const [newDrawingDate, setNewDrawingDate] = useState('');
    const [newCampaignName, setNewCampaignName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [editingAdminEmail, setEditingAdminEmail] = useState('');
    const [editingAdminPassword, setEditingAdminPassword] = useState('');
    const [editingAdminNewEmail, setEditingAdminNewEmail] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [manualDonorName, setManualDonorName] = useState('');
    const [manualDonorEmail, setManualDonorEmail] = useState('');
    const [manualDonorAmount, setManualDonorAmount] = useState('');
    const [showManualDonationModal, setShowManualDonationModal] = useState(false);

    // Subtract donation
    const [subtractDonorName, setSubtractDonorName] = useState('');
    const [subtractDonorEmail, setSubtractDonorEmail] = useState('');
    const [subtractDonorAmount, setSubtractDonorAmount] = useState('');
    const [subtractDonorNote, setSubtractDonorNote] = useState('');
    const [showSubtractDonationModal, setShowSubtractDonationModal] = useState(false);

    // Purpose-specific donation
    const [purposeDonorName, setPurposeDonorName] = useState('');
    const [purposeDonorEmail, setPurposeDonorEmail] = useState('');
    const [purposeDonorAmount, setPurposeDonorAmount] = useState('');
    const [purposeDonorNote, setPurposeDonorNote] = useState('');
    const [purposeDonorPurpose, setPurposeDonorPurpose] = useState('');
    const [showPurposeDonationModal, setShowPurposeDonationModal] = useState(false);

    // Edit donation
    const [editDonationId, setEditDonationId] = useState('');
    const [editDonorName, setEditDonorName] = useState('');
    const [editDonorEmail, setEditDonorEmail] = useState('');
    const [editDonorAmount, setEditDonorAmount] = useState('');
    const [editDonorNote, setEditDonorNote] = useState('');
    const [editDonorPurpose, setEditDonorPurpose] = useState('');
    const [showEditDonationModal, setShowEditDonationModal] = useState(false);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [tempGoal, setTempGoal] = useState('');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [incomeRange, setIncomeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [settingsSiteName, setSettingsSiteName] = useState('12th Grade Shabbaton');
    const [settingsContactEmail, setSettingsContactEmail] = useState('info@shabbaton.com');
    const [settingsCommissionRate, setSettingsCommissionRate] = useState('5');
    const [settingsThankYouMessage, setSettingsThankYouMessage] = useState('Thank you for your generous donation. Your support makes a real difference.');
    const [settingsDefaultPrize, setSettingsDefaultPrize] = useState('7000');
    const [settingsDefaultGoal, setSettingsDefaultGoal] = useState('10000');
    const [settingsDefaultDuration, setSettingsDefaultDuration] = useState('30');
    const [settingsCurrency, setSettingsCurrency] = useState('USD');
    const [settingsEmailSender, setSettingsEmailSender] = useState('noreply@shabbaton.com');
    const [settingsReceiptSubject, setSettingsReceiptSubject] = useState('Donation Receipt - 12th Grade Shabbaton');

    // Appearance Settings
    const [settingsTheme, setSettingsTheme] = useState('teal');
    const [settingsPrimaryColor, setSettingsPrimaryColor] = useState('#14b8a6');
    const [settingsSecondaryColor, setSettingsSecondaryColor] = useState('#8b5cf6');
    const [settingsLogoUrl, setSettingsLogoUrl] = useState('');
    const [settingsFaviconUrl, setSettingsFaviconUrl] = useState('');
    const [settingsCustomCss, setSettingsCustomCss] = useState('');

    // Personal Pages state
    const [newFundraiserName, setNewFundraiserName] = useState('');
    const [syncedPersonalGoal, setSyncedPersonalGoal] = useState('1000');
    const [editingFundraiser, setEditingFundraiser] = useState<any>(null);
    const [showFundraiserEditModal, setShowFundraiserEditModal] = useState(false);
    const [editFundraiserName, setEditFundraiserName] = useState('');

    // Theme color mapping
    const themeColors = {
        teal: {
            primary: '#14b8a6',
            primaryLight: '#2dd4bf',
            primaryDark: '#0d9488',
            secondary: '#8b5cf6',
            bg: 'bg-teal-600',
            bgLight: 'bg-teal-500',
            bgDark: 'bg-teal-700',
            text: 'text-teal-600',
            shadow: 'shadow-teal-600/30',
            shadowLight: 'shadow-teal-500/20',
        },
        grey: {
            primary: '#6b7280',
            primaryLight: '#9ca3af',
            primaryDark: '#4b5563',
            secondary: '#9ca3af',
            bg: 'bg-gray-600',
            bgLight: 'bg-gray-500',
            bgDark: 'bg-gray-700',
            text: 'text-gray-600',
            shadow: 'shadow-gray-600/30',
            shadowLight: 'shadow-gray-500/20',
        },
    };

    const currentTheme = themeColors[settingsTheme as keyof typeof themeColors] || themeColors.teal;

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const checkUser = useCallback(async () => {
        setIsAuthenticated(true); // Supabase disabled - always authenticated
    }, []);

    useEffect(() => {
        checkUser();
    }, [checkUser]);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin');
            const data = await res.json();
            if (res.ok) {
                setStats(data);
                setIsSuperAdmin(data.isSuperAdmin);
                setIsAdmin(data.isAdmin);
                if (data.settings) {
                    setSettingsSiteName(data.settings.siteName || '12th Grade Shabbaton');
                    setSettingsContactEmail(data.settings.contactEmail || 'info@shabbaton.com');
                    setSettingsCommissionRate(String(data.settings.commissionRate || 5));
                    setSettingsThankYouMessage(data.settings.thankYouMessage || 'Thank you for your generous donation. Your support makes a real difference.');
                    setSettingsDefaultPrize(String(data.settings.defaultPrize || 7000));
                    setSettingsDefaultGoal(String(data.settings.defaultGoal || 10000));
                    setSettingsDefaultDuration(String(data.settings.defaultDuration || 30));
                    setSettingsCurrency(data.settings.currency || 'USD');
                    setSettingsEmailSender(data.settings.emailSender || 'noreply@shabbaton.com');
                    setSettingsReceiptSubject(data.settings.receiptSubject || 'Donation Receipt - 12th Grade Shabbaton');

                    // Sync donation cards from database only if no local unsaved changes
                    if (data.settings.donation_cards && Array.isArray(data.settings.donation_cards) && !hasUnsavedCards) {
                        console.log('[Admin] Syncing donation cards from server');
                        setDonationCards(data.settings.donation_cards);
                    } else if (hasUnsavedCards) {
                        console.log('[Admin] Skipping sync because of unsaved changes');
                    }

                    // Appearance
                    setSettingsTheme(data.settings.theme || 'teal');
                    setSettingsPrimaryColor(data.settings.primaryColor || '#14b8a6');
                    setSettingsSecondaryColor(data.settings.secondaryColor || '#8b5cf6');
                    setSettingsLogoUrl(data.settings.logoUrl || '');
                    setSettingsFaviconUrl(data.settings.faviconUrl || '');
                    setSettingsCustomCss(data.settings.customCss || '');
                }
                setFetchError(null);
            } else {
                setFetchError(data.error || 'Failed to fetch stats');
            }
        } catch (error: any) {
            console.error('Error fetching admin stats:', error);
            setFetchError(error.message || 'Network error');
        } finally {
            setIsLoading(false);
        }
    }, [hasUnsavedCards]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchStats();
            const intervalId = setInterval(() => {
                console.log('[Admin] Running auto-fetch stats (from effect)... hasUnsavedCards:', hasUnsavedCards);
                fetchStats();
            }, 15000);
            return () => clearInterval(intervalId);
        }
    }, [isAuthenticated, fetchStats, hasUnsavedCards]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setActionMessage('');

        try {
            // Supabase disabled - skip auth
            setIsAuthenticated(true);
        } catch (err: any) {
            setActionMessage('Login failed');
        }
        setIsLoading(false);
    };

    const handleLogout = async () => {
        setIsAuthenticated(false);
        setStats(null);
    };

    const handleUpdateCampaign = async () => {
        setIsLoading(true);
        try {
            const updatePayload: any = { action: 'updateCampaign' };
            if (newPrize) updatePayload.prizeAmount = newPrize;
            if (newGoal) updatePayload.goalAmount = newGoal;
            if (newDrawingDate) updatePayload.drawingDate = newDrawingDate;
            if (newCampaignName) updatePayload.campaignName = newCampaignName;

            if (Object.keys(updatePayload).length === 1) {
                setActionMessage('No fields to update.');
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
            });

            const data = await response.json();
            if (response.ok) {
                setActionMessage('Live Campaign Synchronized Successfully.');
                fetchStats();
            } else {
                setActionMessage(data.error || 'Sync Failure: Access Denied or Protocol Error');
            }
        } catch {
            setActionMessage('Critical Protocol Error during Campaign Sync');
        }
        setIsLoading(false);
    };

    const handleSelectWinner = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'selectWinner' }),
            });
            const data = await res.json();
            if (data.success) {
                setWinner(data.winner);
                setShowWinnerModal(true);
                fetchStats();
            } else {
                setActionMessage(data.error || 'Failed to Select Recipient');
            }
        } catch {
            setActionMessage('Error selecting winner');
        }
        setIsLoading(false);
    };

    const handleResetRaffle = async () => {
        if (!window.confirm('CRITICAL: This will PERMANENTLY delete all current donation records and reset the campaign. Are you sure?')) return;
        
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'resetRaffle',
                    campaignName: newCampaignName || 'Campaign',
                    prizeAmount: Number(newPrize) || (stats?.raffle.prizeAmount || 7000),
                    goalAmount: Number(newGoal) || (stats?.raffle.goalAmount || 10000),
                    drawingDate: newDrawingDate ? new Date(newDrawingDate).toISOString() : (stats?.raffle.drawingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setActionMessage(data.message || 'New campaign started successfully');
                fetchStats();
                setNewPrize('');
                setNewGoal('');
                setNewDrawingDate('');
                setNewCampaignName('');
                setActiveTab('overview');
            } else {
                setActionMessage(data.error || 'Failed to reset campaign');
            }
        } catch {
            setActionMessage('Error resetting raffle');
        }
        setIsLoading(false);
    };

    const handleDeleteCampaign = async (campaignId: number) => {
        if (!window.confirm('Are you sure you want to delete this entire fundraising session? This cannot be undone.')) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deleteCampaign',
                    campaignId,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setActionMessage('Campaign session deleted successfully');
                fetchStats();
            } else {
                setActionMessage(data.error || 'Failed to delete campaign');
            }
        } catch {
            setActionMessage('Error deleting campaign');
        }
        setIsLoading(false);
    };

    const handleExportCSV = async () => {
        const donations = stats?.donations || [];
        if (donations.length === 0) {
            setActionMessage('No donations to export');
            return;
        }

        try {
            // Dynamic import of ExcelJS to prevent Edge build errors
            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Donations');

            // Define columns with widths
            worksheet.columns = [
                { header: 'Name', key: 'name', width: 30 },
                { header: 'Email', key: 'email', width: 35 },
                { header: 'Amount', key: 'amount', width: 15 },
                { header: 'Timestamp', key: 'timestamp', width: 25 },
            ];

            // Add data
            donations.forEach((d: any) => {
                worksheet.addRow({
                    name: d.name,
                    email: d.email,
                    amount: d.amount,
                    timestamp: new Date(d.timestamp).toLocaleString(),
                });
            });

            // Style header row
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF14B8A6' } };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 25;

            // Add borders to all cells
            worksheet.eachRow((row, rowNumber) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                    if (rowNumber > 1) {
                        cell.alignment = { vertical: 'middle', horizontal: 'left' };
                    }
                });
            });

            // Format amount column as currency
            worksheet.getColumn('amount').numFmt = '$#,##0.00';

            // Set print settings
            worksheet.pageSetup = {
                orientation: 'landscape',
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0,
                horizontalCentered: true,
                margins: {
                    left: 0.5,
                    right: 0.5,
                    top: 0.5,
                    bottom: 0.5,
                    header: 0.3,
                    footer: 0.3,
                },
            };

            // Add header/footer
            worksheet.headerFooter = {
                differentFirst: false,
                oddHeader: '&C&"Arial,Bold"16Donation Report',
                oddFooter: '&CPage &P of &N',
            };

            // Freeze header row
            worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

            // Generate buffer and download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `donations_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setActionMessage('Excel exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            setActionMessage('Export failed');
        }
    };

    const handleSaveSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'saveSettings',
                    siteName: settingsSiteName,
                    contactEmail: settingsContactEmail,
                    commissionRate: settingsCommissionRate,
                    thankYouMessage: settingsThankYouMessage,
                    defaultPrize: settingsDefaultPrize,
                    defaultGoal: settingsDefaultGoal,
                    defaultDuration: settingsDefaultDuration,
                    currency: settingsCurrency,
                    emailSender: settingsEmailSender,
                    receiptSubject: settingsReceiptSubject,
                    theme: settingsTheme,
                    primaryColor: settingsPrimaryColor,
                    secondaryColor: settingsSecondaryColor,
                    logoUrl: settingsLogoUrl,
                    faviconUrl: settingsFaviconUrl,
                    customCss: settingsCustomCss,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setActionMessage('Settings saved successfully');
                fetchStats();
            } else {
                setActionMessage(data.error || 'Failed to save settings');
            }
        } catch {
            setActionMessage('Error saving settings');
        }
        setIsLoading(false);
    };

    const handleUpdateGoal = async () => {
        if (!tempGoal) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'updateGoal',
                    goalAmount: Number(tempGoal),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setActionMessage('Goal updated successfully');
                setIsEditingGoal(false);
                fetchStats();
            } else {
                setActionMessage(data.error || 'Failed to update goal');
            }
        } catch {
            setActionMessage('Error updating goal');
        }
        setIsLoading(false);
    };

    const handleInviteAdmin = async () => {
        if (!newAdminEmail || !newAdminPassword) return;
        setIsLoading(true);
        try {
            console.log('[AdminPage] Adding admin:', newAdminEmail);
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'addAdmin',
                    email: newAdminEmail,
                    password: newAdminPassword,
                }),
            });
            const data = await res.json();
            console.log('[AdminPage] Add admin response:', data);
            setActionMessage(data.message);
            setNewAdminEmail('');
            setNewAdminPassword('');
            fetchStats();
        } catch (error) {
            console.log('[AdminPage] Error inviting admin:', error);
            setActionMessage('Error inviting admin');
        }
        setIsLoading(false);
    };

    const handleRemoveAdmin = async (adminEmail: string) => {
        if (!window.confirm(`Remove Member: Are you sure you want to remove ${adminEmail}?`)) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'removeAdmin',
                    email: adminEmail,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setActionMessage(data.message);
                fetchStats();
            } else {
                setActionMessage(data.error || 'Failed to remove admin');
            }
        } catch {
            setActionMessage('Error removing admin');
        }
        setIsLoading(false);
    };

    const handleEditAdmin = (adminEmail: string) => {
        setEditingAdminEmail(adminEmail);
        setEditingAdminNewEmail(adminEmail);
        setEditingAdminPassword('');
        setShowEditModal(true);
    };

    const handleUpdateAdmin = async () => {
        if (!editingAdminEmail) return;
        setIsLoading(true);
        try {
            // Update email if changed
            if (editingAdminNewEmail && editingAdminNewEmail !== editingAdminEmail) {
                const res = await fetch('/api/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'updateAdminEmail',
                        email: editingAdminEmail,
                        newEmail: editingAdminNewEmail,
                    }),
                });
                const data = await res.json();
                if (!data.success) {
                    setActionMessage(data.error || 'Failed to update email');
                    setIsLoading(false);
                    return;
                }
            }
            
            // Update password if provided
            if (editingAdminPassword) {
                const res = await fetch('/api/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'updateAdminPassword',
                        email: editingAdminNewEmail || editingAdminEmail,
                        password: editingAdminPassword,
                    }),
                });
                const data = await res.json();
                if (!data.success) {
                    setActionMessage(data.error || 'Failed to update password');
                    setIsLoading(false);
                    return;
                }
            }
            
            setActionMessage('Admin updated successfully');
            setShowEditModal(false);
            setEditingAdminEmail('');
            setEditingAdminNewEmail('');
            setEditingAdminPassword('');
            fetchStats();
        } catch {
            setActionMessage('Error updating admin');
        }
        setIsLoading(false);
    };

    const handleAddManualDonation = async () => {
        if (!manualDonorName || !manualDonorAmount) return;
        
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'addDonation',
                    name: manualDonorName,
                    email: manualDonorEmail,
                    amount: Number(manualDonorAmount),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setActionMessage('Donation added successfully');
                setShowManualDonationModal(false);
                setManualDonorName('');
                setManualDonorEmail('');
                setManualDonorAmount('');
                fetchStats();
            } else {
                setActionMessage(data.error || 'Failed to add donation');
            }
        } catch {
            setActionMessage('Error adding donation');
        }
        setIsLoading(false);
    };

    const handleSubtractDonation = async () => {
        if (!subtractDonorName || !subtractDonorAmount) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'subtractDonation',
                    name: subtractDonorName,
                    email: subtractDonorEmail,
                    amount: Number(subtractDonorAmount),
                    note: subtractDonorNote,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setActionMessage(data.message || 'Donation subtracted successfully');
                setShowSubtractDonationModal(false);
                setSubtractDonorName('');
                setSubtractDonorEmail('');
                setSubtractDonorAmount('');
                setSubtractDonorNote('');
                fetchStats();
            } else {
                setActionMessage(data.error || 'Failed to subtract donation');
            }
        } catch {
            setActionMessage('Error subtracting donation');
        }
        setIsLoading(false);
    };

    const handleDeleteDonation = async (donationId: string) => {
        if (!confirm('Are you sure you want to delete this donation?')) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deleteDonation',
                    donationId,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setActionMessage('Donation deleted successfully');
                fetchStats();
            } else {
                setActionMessage(data.error || 'Failed to delete donation');
            }
        } catch {
            setActionMessage('Error deleting donation');
        }
        setIsLoading(false);
    };

    const handleEditDonation = (donation: any) => {
        setEditDonationId(donation.id);
        setEditDonorName(donation.name);
        setEditDonorEmail(donation.email);
        setEditDonorAmount(donation.amount.toString());
        setEditDonorNote(donation.note || '');
        setEditDonorPurpose(donation.purpose || '');
        setShowEditDonationModal(true);
    };

    const handleSaveEditDonation = async () => {
        if (!editDonorName || !editDonorAmount) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'editDonation',
                    donationId: editDonationId,
                    name: editDonorName,
                    email: editDonorEmail,
                    amount: Number(editDonorAmount),
                    note: editDonorNote,
                    purpose: editDonorPurpose,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setActionMessage('Donation updated successfully');
                setShowEditDonationModal(false);
                setEditDonationId('');
                setEditDonorName('');
                setEditDonorEmail('');
                setEditDonorAmount('');
                setEditDonorNote('');
                setEditDonorPurpose('');
                fetchStats();
            } else {
                setActionMessage(data.error || 'Failed to update donation');
            }
        } catch {
            setActionMessage('Error updating donation');
        }
        setIsLoading(false);
    };

    const handleAddPurposeDonation = async () => {
        if (!purposeDonorName || !purposeDonorAmount || !purposeDonorPurpose) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'addDonation',
                    name: purposeDonorName,
                    email: purposeDonorEmail,
                    amount: Number(purposeDonorAmount),
                    note: purposeDonorNote,
                    purpose: purposeDonorPurpose,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setActionMessage('Purpose donation added successfully');
                setShowPurposeDonationModal(false);
                setPurposeDonorName('');
                setPurposeDonorEmail('');
                setPurposeDonorAmount('');
                setPurposeDonorNote('');
                setPurposeDonorPurpose('');
                fetchStats();
            } else {
                setActionMessage(data.error || 'Failed to add donation');
            }
        } catch {
            setActionMessage('Error adding donation');
        }
        setIsLoading(false);
    };

    const handleAddFundraiser = async () => {
        if (!newFundraiserName) return;
        
        // Check if fundraiser with this name already exists
        const existingFundraiser = stats?.fundraisers?.find(
            (f: any) => f.name.toLowerCase() === newFundraiserName.toLowerCase()
        );
        
        if (existingFundraiser) {
            setActionMessage('A personal page for this name already exists');
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'addFundraiser',
                    name: newFundraiserName,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setNewFundraiserName('');
                fetchStats();
                setActionMessage('Personal page created!');
            } else {
                setActionMessage(data.error || 'Failed to create page');
            }
        } catch (err) {
            setActionMessage('Error creating page');
        }
        setIsLoading(false);
    };

    const handleSyncFundraiserGoals = async () => {
        if (!syncedPersonalGoal) return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'syncFundraiserGoals',
                    goal: syncedPersonalGoal
                }),
            });
            const data = await response.json();
            if (data.success) {
                fetchStats();
                setActionMessage(data.message);
            } else {
                setActionMessage(data.error || 'Failed to sync goals');
            }
        } catch (err) {
            setActionMessage('Error syncing goals');
        }
        setIsLoading(false);
    };

    const handleDeleteFundraiser = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this personal page?')) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deleteFundraiser',
                    id,
                }),
            });
            const data = await res.json();
            if (data.success) {
                fetchStats();
                setActionMessage('Personal page removed');
            } else {
                setActionMessage(data.error || 'Failed to remove page');
            }
        } catch {
            setActionMessage('Error removing page');
        }
        setIsLoading(false);
    };

    const handleEditFundraiserClick = (fundraiser: any) => {
        setEditingFundraiser(fundraiser);
        setEditFundraiserName(fundraiser.name);
        setShowFundraiserEditModal(true);
    };

    const handleUpdateFundraiser = async () => {
        if (!editingFundraiser) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'updateFundraiser',
                    id: editingFundraiser.id,
                    name: editFundraiserName
                }),
            });
            const data = await res.json();
            if (data.success) {
                setShowFundraiserEditModal(false);
                fetchStats();
                setActionMessage('Fundraiser updated');
            } else {
                setActionMessage(data.error || 'Failed to update fundraiser');
            }
        } catch {
            setActionMessage('Error updating fundraiser');
        }
        setIsLoading(false);
    };

    const filteredDonations = stats?.donations.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const incomeSeries = useMemo(() => {
        const donations = stats?.donations || [];
        
        const now = new Date();
        let start: Date;
        let intervalHours: number;
        let numPoints: number;
        
        if (incomeRange === '24h') {
            start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            intervalHours = 1;
            numPoints = 24;
        } else if (incomeRange === '7d') {
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            intervalHours = 24; // Daily points for 7 days
            numPoints = 7;
        } else if (incomeRange === '30d') {
            start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            intervalHours = 24;
            numPoints = 30;
        } else {
            // All time
            if (donations.length > 0) {
                const oldestTs = donations.reduce((min, d) => Math.min(min, new Date(d.timestamp).getTime()), now.getTime());
                start = new Date(oldestTs);
                start.setHours(0, 0, 0, 0);
                const days = Math.ceil((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
                numPoints = Math.max(7, days);
                intervalHours = 24;
            } else {
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                numPoints = 30;
                intervalHours = 24;
            }
        }
        
        // Normalize start to interval
        if (intervalHours === 24) {
            start.setHours(0, 0, 0, 0);
        } else {
            start.setMinutes(0, 0, 0);
        }

        const dataMap = new Map<string, number>();
        donations.forEach(d => {
            const dt = new Date(d.timestamp);
            if (dt < start) return;

            const bucket = new Date(dt);
            if (intervalHours === 24) {
                bucket.setHours(0, 0, 0, 0);
            } else {
                bucket.setMinutes(0, 0, 0);
                bucket.setHours(Math.floor(dt.getHours() / intervalHours) * intervalHours);
            }
            const key = bucket.getTime().toString();
            dataMap.set(key, (dataMap.get(key) || 0) + Number(d.amount));
        });

        const series: { hour: string; total: number; fullLabel: string }[] = [];
        for (let i = 0; i <= numPoints; i++) {
            const current = new Date(start.getTime() + i * intervalHours * 60 * 60 * 1000);
            if (current > now && i !== 0 && incomeRange !== 'all') continue;

            const key = current.getTime().toString();
            let label: string;
            if (intervalHours < 24) {
                label = `${String(current.getHours()).padStart(2, '0')}:00`;
            } else {
                label = `${String(current.getMonth() + 1).padStart(2, '0')}/${String(current.getDate()).padStart(2, '0')}`;
            }
            
            series.push({
                hour: label,
                total: dataMap.get(key) || 0,
                fullLabel: current.toLocaleString()
            });
        }
        
        return series;
    }, [stats?.donations, incomeRange]);

    const incomeTotal = useMemo(() => {
        const donations = stats?.donations || [];
        const now = new Date();
        let start: Date;
        
        if (incomeRange === '24h') {
            start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        } else if (incomeRange === '7d') {
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (incomeRange === '30d') {
            start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        } else {
            // All time
            if (donations.length > 0) {
                const oldestTimestamp = donations.reduce((min, d) => {
                    const ts = new Date(d.timestamp).getTime();
                    return ts < min ? ts : min;
                }, now.getTime());
                start = new Date(oldestTimestamp);
            } else {
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
        }
        
        return donations
            .filter(d => new Date(d.timestamp) >= start)
            .reduce((sum, d) => sum + Number(d.amount), 0);
    }, [stats?.donations, incomeRange]);

    // Login screen
    if (!isAuthenticated) {
        return (
            <div className={`min-h-screen flex flex-col md:flex-row bg-gray-50 font-sans text-gray-900 selection:${currentTheme.bgLight}/30`}>
                {/* Back Button */}
                <motion.button
                    onClick={() => window.history.back()}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="fixed top-8 left-8 z-50 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-xl shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </motion.button>

                {/* Left Side: Visual/Branding */}
                <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-gray-200 relative items-center justify-center p-12">
                    <div className="relative z-10 max-w-lg text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="w-20 h-20 bg-white/60 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center mb-12 border border-white/80 shadow-xl relative group overflow-hidden">
                                <div className={`absolute inset-0 ${currentTheme.bgLight}/10 opacity-0 group-hover:opacity-100 transition-opacity`} />
                                <Icons.Shield />
                            </div>
                            <h2 className="text-6xl lg:text-8xl font-display font-black text-gray-900 leading-[0.9] mb-10 tracking-tighter">
                                ADMIN <br />
                                <span className={`${currentTheme.text}`}>DASHBOARD</span>
                            </h2>
                            <p className="text-gray-600 text-xl font-bold uppercase tracking-[0.2em] mb-12 max-w-md text-[10px]">
                                Manage donations and campaigns.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/60 backdrop-blur-md border border-gray-200 p-8 rounded-3xl">
                                    <div className="text-gray-900 text-2xl mb-1 font-black tabular-nums">24/7</div>
                                    <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">Always On</p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-md border border-gray-200 p-8 rounded-3xl">
                                    <div className={`${currentTheme.text} text-2xl mb-1 font-black tabular-nums`}>TLS</div>
                                    <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">Secure</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="absolute bottom-12 left-12 flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500  shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-gray-900 font-display font-black text-xs uppercase tracking-[0.4em]">Donate / v2.4.0</span>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="flex-1 flex items-center justify-center p-12 bg-gray-100 border-l border-gray-200 relative">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full max-w-md relative z-10"
                    >
                        <div className="mb-16">
                            <h1 className="text-4xl font-display font-black text-gray-900 mb-4 tracking-tighter uppercase">Sign In</h1>
                            <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px]">Access your admin dashboard.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-8">
                            <div className="space-y-3 group">
                                <label className={`text-[10px] font-black text-gray-600 uppercase tracking-widest block transition-colors group-focus-within:${currentTheme.text}`}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@itsshabbaton.com"
                                    className="w-full bg-white/60 border border-white/80 text-gray-900 placeholder:text-zinc-800 rounded-2xl py-5 px-6 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all font-black"
                                    required
                                />
                            </div>

                            <div className="space-y-3 group">
                                <label className={`text-[10px] font-black text-gray-600 uppercase tracking-widest block transition-colors group-focus-within:${currentTheme.text}`}>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/60 border border-white/80 text-gray-900 placeholder:text-zinc-800 rounded-2xl py-5 px-6 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all font-black"
                                    required
                                />
                            </div>

                            {actionMessage && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`p-6 rounded-2xl flex items-center gap-4 border ${
                                        actionMessage.includes('Success') || actionMessage.includes('Check your email')
                                            ? 'bg-green-100 border-green-200 text-green-700'
                                            : 'bg-red-100 border-red-200 text-red-700'
                                    }`}
                                >
                                    <div className="flex-1 text-[10px] font-black uppercase tracking-widest leading-relaxed">{actionMessage}</div>
                                </motion.div>
                            )}

                            <button
                                disabled={isLoading}
                                type="submit"
                                className="w-full py-6 rounded-2xl bg-white text-zinc-950 font-black text-xs uppercase tracking-[0.4em] transition-all hover:bg-zinc-200 active:scale-105 shadow-xl"
                            >
                                {isLoading ? 'SYNCING...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-24 pt-8 border-t border-gray-200 text-center">
                            <p className="text-gray-700 text-[9px] font-black uppercase tracking-[0.4em]">
                                Secure admin access &bull; v2.4
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }
    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Back Button */}
            <motion.button
                onClick={() => window.history.back()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed top-8 left-8 z-[100] bg-white text-gray-800 p-3 rounded-xl shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </motion.button>

            {/* Sidebar Navigation */}
            <aside className="w-72 bg-gray-100 hidden md:flex flex-col sticky top-0 h-screen border-r border-gray-300 shadow-xl z-[60]">
                <div className="p-8 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${currentTheme.bg} rounded-xl flex items-center justify-center shadow-lg ${currentTheme.shadow} relative group overflow-hidden`}>
                            <div className="absolute inset-0 bg-gradient-to-tr from-gray-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Icons.Shield />
                        </div>
                        <div>
                            <h2 className="font-display font-bold text-lg leading-tight tracking-tight text-gray-900 mb-0.5">Donate</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Admin Dashboard</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    {[
                        { id: 'overview', name: 'Overview', icon: <Icons.Dashboard /> },
                        { id: 'donations', name: 'Donations', icon: <Icons.Donations /> },
                        { id: 'purposes', name: 'Donation Cards', icon: <Icons.Campaign /> },
                        { id: 'raffle', name: 'Campaign', icon: <Icons.Campaign /> },
                        { id: 'income', name: 'Analytics', icon: <Icons.Chart /> },
                        { id: 'campaigns', name: 'History', icon: <Icons.History /> },
                        { id: 'personal', name: 'Personal Pages', icon: <Icons.Admins /> },
                        { id: 'settings', name: 'Settings', icon: <Icons.Dashboard /> },
                        ...(isSuperAdmin ? [
                            { id: 'commission', name: 'Commission', icon: <Icons.Donations /> },
                            { id: 'admins', name: 'Team', icon: <Icons.Admins /> },
                        ] : []),
                    ]
                        .map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest relative z-[70] ${activeTab === item.id
                                ? `${currentTheme.bg} text-white shadow-md`
                                : 'text-gray-600 hover:bg-white hover:text-gray-900'}`}
                        >
                            <span>
                                {item.icon}
                            </span>
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 font-bold text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
                    >
                        <span className="text-gray-600 group-hover:text-red-600 transition-colors">
                            <Icons.Logout />
                        </span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 bg-gray-100 overflow-y-auto">
                <header className="bg-gray-100/80 backdrop-blur-2xl border-b border-gray-200 sticky top-0 z-30 px-8 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-2 w-2 rounded-full bg-emerald-500  shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">System Online</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none">Admin Dashboard v3.0</span>
                                <span className="text-[9px] font-bold ${currentTheme.text} uppercase tracking-widest mt-1.5">{isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/60 border border-white/80 flex items-center justify-center text-xs font-black text-gray-900 shadow-xl relative overflow-hidden group hover:scale-105 transition-transform">
                                <div className="absolute inset-x-0 bottom-0 h-1 ${currentTheme.bgLight} shadow-[0_-4px_12px_rgba(20,184,166,0.5)]" />
                                {isSuperAdmin ? 'SA' : 'OP'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 lg:p-12 max-w-7xl mx-auto">
                    {/* Top Header */}
                    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-display font-black text-gray-900 tracking-tighter leading-none mb-3">
                                {activeTab === 'overview' && 'Overview'}
                                {activeTab === 'donations' && 'Donations'}
                                {activeTab === 'purposes' && 'Donation Cards'}
                                {activeTab === 'raffle' && 'Settings'}
                                {activeTab === 'income' && 'Charts'}
                                {activeTab === 'campaigns' && 'Past Campaigns'}
                                {activeTab === 'commission' && 'Commission'}
                                {activeTab === 'admins' && 'Team'}
                                {activeTab === 'personal' && 'Personal Pages'}
                                {activeTab === 'settings' && 'Site Settings'}
                            </h1>
                            <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                                {activeTab === 'overview' && 'View how the current campaign is doing.'}
                                {activeTab === 'donations' && 'See a list of all recent donations.'}
                                {activeTab === 'purposes' && 'Manage donation cards and add purpose-specific donations.'}
                                {activeTab === 'raffle' && 'Update campaign goal, prize, and end date.'}
                                {activeTab === 'income' && 'See donation trends and totals over time.'}
                                {activeTab === 'campaigns' && 'Look at data from finished campaigns.'}
                                {activeTab === 'commission' && 'Calculate platform fees.'}
                                {activeTab === 'admins' && 'Manage who has access to this dashboard.'}
                                {activeTab === 'personal' && 'Manage personal donation pages.'}
                                {activeTab === 'settings' && 'Configure platform options.'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 px-4 bg-white/60 border border-white/80 rounded-xl flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {currentTime.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' })} UTC
                            </div>
                        </div>
                    </div>

                    {!stats ? (
                        <div className="flex flex-col items-center justify-center py-48 bg-gray-100 rounded-[40px] border border-gray-200 shadow-xl transition-all relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.03),transparent)]" />
                            {fetchError ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center relative z-10 px-8"
                                >
                                    <div className="w-20 h-20 bg-red-100 border border-red-200 rounded-full flex items-center justify-center text-3xl mb-8 mx-auto shadow-xl shadow-rose-500/10">
                                        ⚠️
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-3">Sync-Failure Detected</h3>
                                    <p className="text-gray-600 font-bold text-xs uppercase tracking-widest max-w-md mx-auto mb-10 leading-relaxed">{fetchError}</p>
                                    <button 
                                        onClick={() => { setFetchError(null); fetchStats(); }}
                                        className="px-10 py-4 bg-white text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
                                    >
                                        Execute Hard-Refresh
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center relative z-10"
                                >
                                    <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-[10px]">Syncing Global Matrix...</p>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="space-y-10">
                                    {/* Progress DASHBOARD */}
                                    <div className="bg-gray-100 p-8 rounded-[32px] border border-gray-200 relative group shadow-xl">
                                        <div className="relative z-10">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-2">Campaign Progress</h3>
                                                    <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px]">Real-time update of total donations.</p>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-10">
                                                <ProgressBar 
                                                    current={stats.totalRaised} 
                                                    goal={stats.raffle.goalAmount} 
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">Total Raised</p>
                                                    <p className="text-5xl font-display font-black text-gray-900 tabular-nums tracking-tighter leading-none">${stats.totalRaised.toLocaleString()}</p>
                                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                                        <span className="text-emerald-600">Site: ${stats.siteRaised.toLocaleString()}</span>
                                                        <span className="text-blue-600">Admin: ${stats.adminRaised.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">Campaign Goal</p>
                                                    <p className="text-5xl font-display font-black text-gray-400 tabular-nums tracking-tighter leading-none">${stats.raffle.goalAmount.toLocaleString()}</p>
                                                </div>
                                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">Prize Amount</p>
                                                    <p className="text-5xl font-display font-black ${currentTheme.text} tabular-nums tracking-tighter leading-none">${stats.raffle.prizeAmount.toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-end">
                                                    <button 
                                                        onClick={() => setActiveTab('raffle')}
                                                        className="w-full px-10 py-5 rounded-2xl ${currentTheme.bg} text-white font-black text-xs uppercase tracking-[0.3em] hover:${currentTheme.bgDark} transition-all active:scale-95 shadow-lg"
                                                    >
                                                        Edit Campaign
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-8">
                                            {/* Advanced Stats Row */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                {[
                                                    { label: 'Total Raised', value: `$${stats.totalRaised.toLocaleString()}`, trend: '+14.2%', color: 'teal' },
                                                    { label: 'Total Donations', value: stats.totalDonations, trend: `+${Math.round(stats.totalDonations * 0.05)}`, color: 'emerald' },
                                                    { label: 'Average Donation', value: `$${Math.round(stats.totalRaised / (stats.totalDonations || 1))}`, trend: 'Stable', color: 'blue' },
                                                ].map((stat) => (
                                                    <div key={stat.label} className="bg-gray-100/50 p-6 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                                                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-500/10 blur-[40px] group-hover:bg-${stat.color}-500/20 transition-all duration-700`} />
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center text-lg`}>
                                                                {stat.label === 'Total Raised' && '💎'}
                                                                {stat.label === 'Total Donations' && '⚡'}
                                                                {stat.label === 'Average Donation' && '📊'}
                                                            </div>
                                                            <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md border ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white/60 text-gray-600 border-gray-200'}`}>
                                                                {stat.trend}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1.5">{stat.label}</p>
                                                        <p className="text-3xl font-display font-black text-gray-900 tracking-tighter leading-none">{stat.value}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* High Fidelity Performance Area Chart */}
                                            <div className="bg-gray-100 p-8 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent" />
                                                <div className="flex items-center justify-between mb-10">
                                                    <div>
                                                        <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Global Performance Matrix</h3>
                                                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] mt-2">Simulated Live Relay Volume &bull; v2.0</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-xl border border-white/80">
                                                        <div className="w-2 h-2 rounded-full ${currentTheme.bgLight} shadow-[0_0_12px_rgba(20,184,166,0.6)] " />
                                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Spectral Stream</span>
                                                    </div>
                                                </div>
                                                <div className="h-[320px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={incomeSeries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.12} />
                                                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid vertical={false} stroke="#ffffff10" strokeDasharray="4 4" />
                                                            <XAxis dataKey="hour" hide />
                                                            <YAxis 
                                                                tickFormatter={(v) => `$${v}`}
                                                                tick={{ fill: '#52525b', fontSize: 10, fontWeight: 900 }}
                                                                axisLine={false}
                                                                tickLine={false}
                                                                domain={[0, 'auto']}
                                                            />
                                                            <Tooltip
                                                                content={({ active, payload, label }) => {
                                                                    if (active && payload && payload.length) {
                                                                        const parts = String(label).split('-');
                                                                        const formattedTime = parts.length === 4 ? `${parts[1]}/${parts[2]} ${parts[3]}:00` : label;
                                                                        return (
                                                                            <div className="bg-gray-100/95 backdrop-blur-xl text-gray-900 p-4 rounded-xl shadow-xl border border-white/80 ring-1 ring-white/10">
                                                                                <p className="text-[9px] opacity-40 uppercase tracking-widest font-black mb-1">{formattedTime}</p>
                                                                                <p className="text-xl tabular-nums font-bold tracking-tighter">${payload[0].value?.toLocaleString()}</p>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                }}
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="total"
                                                                stroke="#14b8a6"
                                                                strokeWidth={4}
                                                                strokeLinecap="round"
                                                                fill="url(#chartGradient)"
                                                                animationDuration={2500}
                                                                isAnimationActive={false}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                        </div>
                            {/* Activity Sidebar */}
                            <div className="bg-gray-100 rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col h-full relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
                                            <div className="p-8 border-b border-gray-200 flex items-center justify-between bg-white/[0.01]">
                                                <div>
                                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-900">Live Operations</h3>
                                                    <p className="text-[9px] text-gray-600 font-black uppercase mt-1">Global Broadcast Manifest</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto max-h-[1000px] scrollbar-hide px-2">
                                                {stats.donations.slice(0, 15).map((d, i) => (
                                                    <div key={d.id} className="m-2 p-5 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-white/[0.02] transition-all duration-300 group flex items-start gap-5">
                                                        <div className="w-12 h-12 rounded-xl bg-gray-800 text-gray-900 flex items-center justify-center font-black text-xs ring-1 ring-white/10 relative overflow-hidden shadow-xl group-hover:ring-gray-500/50 transition-all">
                                                            <div className="absolute inset-x-0 bottom-0 h-0.5 ${currentTheme.bgLight} opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            {d.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <p className="text-[14px] font-black text-gray-900 truncate pr-2 tracking-tight group-hover:${currentTheme.text} transition-colors">{d.name}</p>
                                                                <p className="text-[14px] font-black ${currentTheme.text} tabular-nums tracking-tighter">${d.amount}</p>
                                                            </div>
                                                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider truncate mb-3">{d.email}</p>
                                                            <div className="flex items-center gap-3">
                                                                    <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">
                                                                    {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={() => setActiveTab('donations')} className="w-full p-6 bg-white/[0.03] text-gray-900 text-[9px] font-black uppercase tracking-[0.3em] hover:${currentTheme.bg} transition-all border-t border-gray-200 active:scale-95">
                                                Verify Full Ledger Archive
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DONATIONS TAB */}
                            {activeTab === 'donations' && (
                                <div className="bg-gray-100 rounded-3xl border border-gray-200 shadow-xl overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    <div className="p-10 space-y-10">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                            <div className="relative flex-1 max-w-2xl group">
                                                <input
                                                    type="text"
                                                    placeholder="Search Donations by identity or email..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full bg-white/[0.03] border border-white/80 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-gray-500/50 font-bold text-xs uppercase tracking-widest placeholder:text-gray-600 transition-all hover:bg-white/[0.05]"
                                                />
                                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:${currentTheme.text} transition-colors`}>
                                                    <Icons.Dashboard />
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setShowManualDonationModal(true)}
                                                    className={`h-14 px-8 ${currentTheme.bg} rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] hover:${currentTheme.bgDark} transition-all active:scale-95 shadow-lg ${currentTheme.shadow}`}
                                                >
                                                    Add Donation
                                                </button>
                                                <button
                                                    onClick={() => setShowSubtractDonationModal(true)}
                                                    className="h-14 px-8 bg-red-600 hover:bg-red-700 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-red-600/30"
                                                >
                                                    Subtract Donation
                                                </button>
                                                <button
                                                    onClick={handleExportCSV}
                                                    className="h-14 px-8 bg-white/60 border border-white/80 rounded-2xl text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95 shadow-xl"
                                                >
                                                    Secure Excel Export
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-gray-200/20">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-10 py-6 border-b border-gray-200">Subject Identity</th>
                                                        <th className="px-10 py-6 border-b border-gray-200">Timestamp</th>
                                                        <th className="px-10 py-6 border-b border-gray-200 text-right">Settlement (USD)</th>
                                                        <th className="px-10 py-6 border-b border-gray-200 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {filteredDonations.map((d) => (
                                                        <tr key={d.id} className="hover:bg-white/[0.03] transition-colors group">
                                                            <td className="px-10 py-7">
                                                                <p className={`font-black text-gray-900 group-hover:${currentTheme.text} transition-colors tracking-tight text-lg leading-none`}>{d.name}</p>
                                                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2">{d.email}</p>
                                                            </td>
                                                            <td className="px-10 py-7">
                                                                <p className="text-[10px] text-gray-900 font-black tabular-nums tracking-widest">{new Date(d.timestamp).toLocaleDateString()}</p>
                                                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">{new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            </td>
                                                            <td className="px-10 py-7 text-right">
                                                                <span className={`text-2xl font-display font-black text-gray-900 tabular-nums tracking-tighter group-hover:${currentTheme.text} transition-colors`}>${d.amount}</span>
                                                            </td>
                                                            <td className="px-10 py-7 text-right">
                                                                <div className="flex items-center justify-end gap-3">
                                                                    <button
                                                                        onClick={() => handleEditDonation(d)}
                                                                        disabled={isLoading}
                                                                        className="text-gray-600 hover:text-gray-900 font-bold text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteDonation(d.id)}
                                                                        disabled={isLoading}
                                                                        className="text-red-600 hover:text-red-800 font-bold text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* INCOME TAB */}
                            {activeTab === 'income' && (
                                <div className="space-y-10 text-gray-900">
                                    <div className="bg-gray-100 p-10 rounded-3xl border border-gray-200 shadow-xl relative">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 relative z-[60]">
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Donation Charts</h3>
                                                <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                                                    Total Donations: <span className={`${currentTheme.text} font-black tabular-nums tracking-tighter`}>${incomeTotal.toLocaleString()}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm relative z-[70]">
                                                {[
                                                    { id: '24h' as const, label: '24-HOUR' },
                                                    { id: '7d' as const, label: '7-DAY' },
                                                    { id: '30d' as const, label: '30-DAY' },
                                                    { id: 'all' as const, label: 'MAX-LOG' },
                                                ].map((r) => (
                                                    <button
                                                        key={r.id}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setIncomeRange(r.id);
                                                        }}
                                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all relative z-[80] ${
                                                            incomeRange === r.id
                                                                ? `${currentTheme.bg} text-white shadow-md`
                                                                : 'text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        {r.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {incomeSeries.length === 0 ? (
                                            <div className="py-24 rounded-2xl bg-white/[0.02] border border-dashed border-white/80 text-center">
                                                <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px]">No data found for this period</p>
                                            </div>
                                        ) : (
                                            <div className="h-[400px] w-full mt-4">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={incomeSeries} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                                        <defs>
                                                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                                                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid vertical={false} stroke="#52525b20" strokeDasharray="8 8" />
                                                        <XAxis
                                                            dataKey="hour"
                                                            tickFormatter={(v, index) => {
                                                                // Only show every 5th label for 30d/all views to prevent overlap
                                                                if (incomeRange === '30d' || incomeRange === 'all') {
                                                                    return index % 5 === 0 ? String(v) : '';
                                                                }
                                                                // Show every 4th label for 24h view (every 4 hours)
                                                                if (incomeRange === '24h') {
                                                                    return index % 4 === 0 ? String(v) : '';
                                                                }
                                                                return String(v);
                                                            }}
                                                            tick={{ fill: '#52525b', fontSize: 10, fontWeight: 900 }}
                                                            axisLine={false}
                                                            tickLine={false}
                                                            dy={10}
                                                            interval={0}
                                                        />
                                                        <YAxis
                                                            tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
                                                            tick={{ fill: '#52525b', fontSize: 10, fontWeight: 900 }}
                                                            axisLine={false}
                                                            tickLine={false}
                                                            width={50}
                                                            domain={[0, 'auto']}
                                                            allowDecimals={false}
                                                            type="number"
                                                        />
                                                        <Tooltip
                                                            content={({ active, payload, label }) => {
                                                                if (active && payload && payload.length) {
                                                                    return (
                                                                        <div className="bg-gray-100/95 backdrop-blur-2xl text-gray-900 p-5 rounded-2xl shadow-xl border border-white/80 ring-1 ring-white/10">
                                                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">{String(label)}</p>
                                                                            <p className="text-2xl font-display font-black text-gray-900 tracking-tighter tabular-nums">${Number(payload[0].value).toLocaleString()}</p>
                                                                            <p className={`text-[10px] ${currentTheme.text} font-black uppercase mt-2 tracking-widest`}>Total Donations</p>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="total"
                                                            stroke="#14b8a6"
                                                            strokeWidth={4}
                                                            fill="url(#incomeGradient)"
                                                            animationDuration={2500}
                                                            isAnimationActive={false}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            )}

                            {/* RAFFLE TAB */}
                            {activeTab === 'raffle' && (
                                <div className="grid lg:grid-cols-2 gap-10">
                                    <div className="bg-gray-100 p-10 rounded-3xl border border-gray-200 shadow-xl flex flex-col h-full group transition-all duration-500 hover:border-white/80 relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-32 h-32 ${currentTheme.bgLight}/10 blur-[80px] -mr-16 -mt-16`} />
                                        <div className="mb-12 relative">
                                            <div className="inline-flex items-center gap-3 px-4 py-2 ${currentTheme.bgLight}/10 ${currentTheme.text} rounded-xl text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-gray-500/20">
                                                <div className="w-2 h-2 rounded-full ${currentTheme.bgLight} " />
                                                Active Campaign
                                            </div>
                                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-tight">Pick a Winner</h3>
                                            <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Choose a random winner from all donations.</p>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center items-center text-center p-12 bg-white/[0.02] rounded-3xl border border-white/80 border-dashed mb-10 overflow-hidden relative">
                                            <div className="absolute inset-0 opacity-[0.05] pointer-events-none flex items-center justify-center text-gray-900 text-9xl font-black">
                                                $
                                            </div>
                                            <div className="text-7xl mb-6 transform transition-transform group-hover:scale-110 duration-500">🎰</div>
                                            <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Participation Statistics</p>
                                            <p className="text-6xl font-display font-black text-gray-900 tracking-tighter mb-3 tabular-nums">{stats.totalDonations}</p>
                                            <p className={`${currentTheme.text} font-black uppercase tracking-widest text-[9px]`}>Synced Liquidity: <span className="text-gray-900 tabular-nums">${stats.totalRaised.toLocaleString()}</span></p>
                                        </div>

                                        <button
                                            onClick={handleSelectWinner}
                                            disabled={isLoading || !stats.raffle.isActive || stats.totalDonations === 0}
                                            className={`w-full py-6 rounded-2xl ${currentTheme.bg} hover:${currentTheme.bgLight} text-gray-900 font-black text-xs uppercase tracking-[0.3em] shadow-xl ${currentTheme.shadow} disabled:opacity-30 transition-all flex items-center justify-center gap-4 active:scale-[0.98]`}
                                        >
                                            <Icons.Campaign />
                                            {isLoading ? 'Processing Signal...' : 'Trigger Random Selection'}
                                        </button>
                                    </div>

                                    <div className="bg-gray-100 p-10 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden flex flex-col h-full">
                                        <div className={`absolute bottom-0 left-0 w-32 h-32 ${currentTheme.bgLight}/10 blur-[80px] -ml-16 -mb-16`} />
                                        <div className="mb-12">
                                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-red-200">
                                                <Icons.Logout />
                                                System Override
                                            </div>
                                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-tight">Session Refresh</h3>
                                            <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Initialize new fundraising parameters and archive current relay data.</p>
                                        </div>

                                        <div className="space-y-8 flex-1">
                                            {[
                                                { label: 'Mission Identifier', value: newCampaignName, setter: setNewCampaignName, type: 'text', placeholder: 'Q1 Fundraiser 2024' },
                                                { label: 'Bounty Allocation (USD)', value: newPrize, setter: setNewPrize, type: 'number', placeholder: '7000' },
                                                { label: 'Target Threshold (USD)', value: newGoal, setter: setNewGoal, type: 'number', placeholder: '10000' },
                                                { label: 'Closure Deadline', value: newDrawingDate, setter: setNewDrawingDate, type: 'datetime-local', placeholder: '', isDate: true },
                                            ].map((field) => (
                                                <div key={field.label} className="group">
                                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>{field.label}</label>
                                                    <input
                                                        type={field.type}
                                                        value={field.value}
                                                        onChange={(e) => field.setter(e.target.value)}
                                                        placeholder={field.placeholder}
                                                        className={`w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none placeholder:text-zinc-800 text-sm ${field.isDate ? '[color-scheme:light]' : '[color-scheme:dark]'}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-4 mt-12">
                                            <button
                                                onClick={handleUpdateCampaign}
                                                disabled={isLoading}
                                                className="flex-1 py-6 rounded-2xl bg-white/60 border border-white/80 hover:bg-white/10 text-gray-900 font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-xl"
                                            >
                                                <Icons.Dashboard />
                                                {isLoading ? 'Syncing...' : 'Live Update'}
                                            </button>
                                            <button
                                                onClick={handleResetRaffle}
                                                disabled={isLoading}
                                                className="flex-1 py-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-gray-900 font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-rose-600/30 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
                                            >
                                                <Icons.Logout />
                                                {isLoading ? 'Resetting...' : 'Hard Reset'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CAMPAIGNS TAB */}
                            {activeTab === 'campaigns' && (
                                <div className="space-y-10">
                                    {!stats?.campaigns || (stats as any).campaigns.length === 0 ? (
                                        <div className="bg-gray-100 rounded-3xl border border-dashed border-white/80 p-24 text-center">
                                            <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px]">Registry Empty: No Historical Relays Found</p>
                                        </div>
                                    ) : (
                                        (stats as any).campaigns.map((campaign: any) => (
                                            <div key={campaign.id} className="bg-gray-100 rounded-3xl border border-gray-200 shadow-xl overflow-hidden group">
                                                <div className="p-10 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/[0.01]">
                                                    <div>
                                                        <h2 className={`text-2xl font-black text-gray-900 tracking-tighter uppercase group-hover:${currentTheme.text} transition-colors`}>{campaign.name || `Session-Archive-${campaign.id}`}</h2>
                                                        <p className="text-gray-600 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Mission Closure: {new Date(campaign.drawingDate).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        {[
                                                            { label: 'Settlement', val: `$${campaign.totalRaised.toLocaleString()}`, color: 'text-green-700 bg-green-100 border-green-200' },
                                                            { label: 'Threshold', val: `$${campaign.goalAmount.toLocaleString()}`, color: `${currentTheme.text} ${currentTheme.bgLight}/10 border-gray-500/20` },
                                                            { label: 'Network Relays', val: campaign.totalDonations, color: 'text-gray-900 bg-white/10 border-white/80' },
                                                        ].map(chip => (
                                                            <div key={chip.label} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${chip.color}`}>
                                                                <span className="opacity-40 font-black mr-2">{chip.label}:</span> {chip.val}
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => handleDeleteCampaign(campaign.id)}
                                                            disabled={isLoading}
                                                            className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors disabled:opacity-30"
                                                        >
                                                            Delete Session
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-10">
                                                    <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-gray-200/20">
                                                        <table className="w-full text-left">
                                                            <thead className="bg-white/[0.02] text-gray-600 text-[9px] font-black uppercase tracking-[0.3em]">
                                                                <tr>
                                                                    <th className="px-8 py-4">Identity</th>
                                                                    <th className="px-8 py-4">Verification</th>
                                                                    <th className="px-8 py-4 text-right">Settlement</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/5">
                                                                {campaign.donors.slice(0, 10).map((d: any) => (
                                                                    <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                                                                        <td className="px-8 py-5">
                                                                            <p className="font-black text-gray-900 text-sm tracking-tight">{d.name}</p>
                                                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">{d.email}</p>
                                                                        </td>
                                                                        <td className={`px-8 py-5 text-right font-black ${currentTheme.text} text-sm tracking-tighter`}>${d.amount}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* PERSONAL PAGES TAB */}
                            {activeTab === 'personal' && (
                                <div className="space-y-10">
                                    <div className="bg-gray-100 p-10 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-32 h-32 ${currentTheme.bgLight}/10 blur-[80px] -mr-16 -mt-16`} />

                                        <div className="flex gap-4 flex-1">
                                            <div className="flex-1 space-y-2">
                                                <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block mb-3 group-focus-within:${currentTheme.text}`}>Full Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={newFundraiserName}
                                                    onChange={(e) => setNewFundraiserName(e.target.value)}
                                                    className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all placeholder:text-zinc-800"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    onClick={handleAddFundraiser}
                                                    className={`h-14 px-10 ${currentTheme.bg} rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.3em] hover:${currentTheme.bgDark} transition-all active:scale-95 shadow-lg`}
                                                >
                                                    Create Page
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-gray-200/40 p-8 rounded-2xl border border-gray-200 mb-12">
                                            <div className="flex flex-col md:flex-row items-center gap-8">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Global Campaign Goal</h4>
                                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">This goal will be synced and displayed on every personal page.</p>
                                                </div>
                                                <div className="flex items-center gap-4 w-full md:w-auto">
                                                    <input
                                                        type="number"
                                                        value={syncedPersonalGoal}
                                                        onChange={(e) => setSyncedPersonalGoal(e.target.value)}
                                                        className="w-full md:w-48 bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm"
                                                    />
                                                    <button
                                                        onClick={handleSyncFundraiserGoals}
                                                        className={`h-11 px-6 ${currentTheme.bg} rounded-xl text-[9px] font-black text-white uppercase tracking-widest shadow-md`}
                                                    >
                                                        Sync Goal
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-gray-200/20">
                                            <table className="w-full text-left">
                                                <thead className="bg-white/[0.02] text-gray-600 text-[9px] font-black uppercase tracking-[0.3em]">
                                                    <tr>
                                                        <th className="px-8 py-4">Name / Slug <span className="ml-2 px-2 py-1 bg-gray-200 rounded-md text-gray-700">{stats.fundraisers?.length || 0}</span></th>
                                                        <th className="px-8 py-4">Raised</th>
                                                        <th className="px-8 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {stats.fundraisers?.map((f) => (
                                                        <tr key={f.id} className="hover:bg-white/[0.02] transition-colors group">
                                                            <td className="px-8 py-5">
                                                                <p className="font-black text-gray-900 text-sm tracking-tight">{f.name}</p>
                                                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">/{f.slug}</p>
                                                            </td>
                                                            <td className="px-8 py-5 font-black text-gray-900 text-sm tracking-tighter">${f.totalRaised.toLocaleString()}</td>
                                                            <td className="px-8 py-5 text-right flex justify-end gap-2">
                                                                <Link href={`/${f.slug}`} target="_blank">
                                                                    <button className={`px-4 py-2 rounded-lg bg-gray-100 ${currentTheme.text} text-[9px] font-black uppercase tracking-widest border border-gray-500/10 hover:${currentTheme.bgLight} hover:text-gray-900 transition-all`}>View</button>
                                                                </Link>
                                                                <button 
                                                                    onClick={() => handleEditFundraiserClick(f)}
                                                                    className={`px-4 py-2 rounded-lg bg-gray-100 ${currentTheme.text} text-[9px] font-black uppercase tracking-widest border border-gray-500/10 hover:${currentTheme.bgLight} hover:text-gray-900 transition-all`}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteFundraiser(f.id)}
                                                                    className="px-4 py-2 rounded-lg bg-red-100 text-rose-500 text-[9px] font-black uppercase tracking-widest border border-rose-500/10 hover:bg-rose-500 hover:text-gray-900 transition-all"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DONATION CARDS TAB */}
                            {activeTab === 'purposes' && (
                                <div className="max-w-6xl mx-auto space-y-8">
                                    <div className="mb-8">
                                        <h2 className="text-4xl font-display font-black text-gray-900 tracking-tighter uppercase mb-2">Donation Cards</h2>
                                        <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px]">Manage donation cards and add purpose-specific donations</p>
                                    </div>

                                    {/* Donation Cards Header Actions */}
                                    <div className="flex flex-wrap items-center gap-4 mb-8">
                                        <button
                                            onClick={() => setShowPurposeDonationModal(true)}
                                            className={`h-14 px-8 ${currentTheme.bg} rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] hover:${currentTheme.bgDark} transition-all active:scale-95 shadow-lg ${currentTheme.shadow}`}
                                        >
                                            Add Purpose Donation
                                        </button>
                                        <button
                                            onClick={() => {
                                                const newId = `card-${Date.now()}`;
                                                setDonationCards([...donationCards, { 
                                                    id: newId, 
                                                    name: 'New Sponsorship', 
                                                    description: 'Description here', 
                                                    emoji: '🎁', 
                                                    price: 100, 
                                                    slug: `new-sponsorship-${Date.now()}` 
                                                }]);
                                                setHasUnsavedCards(true);
                                            }}
                                            className={`h-14 px-8 border-2 border-gray-200 bg-white rounded-2xl text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] hover:bg-gray-50 transition-all active:scale-95 shadow-lg`}
                                        >
                                            + Add New Card
                                        </button>
                                    </div>

                                    {/* Donation Cards Grid */}
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {donationCards.map((card, index) => (
                                            <div key={card.id} className="bg-gray-100 p-6 rounded-3xl border border-gray-200 shadow-xl relative group">
                                                <button
                                                    onClick={() => {
                                                        const newCards = donationCards.filter((_, i) => i !== index);
                                                        setDonationCards(newCards);
                                                        setHasUnsavedCards(true);
                                                    }}
                                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    title="Delete Card"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                                </button>
                                                <div className="mb-4">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block mb-2">Emoji</label>
                                                    <input
                                                        type="text"
                                                        value={card.emoji}
                                                        onChange={(e) => {
                                                            const newCards = [...donationCards];
                                                            newCards[index].emoji = e.target.value;
                                                            setDonationCards(newCards);
                                                            setHasUnsavedCards(true);
                                                        }}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-2 px-3 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-lg text-center"
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block mb-2">Name</label>
                                                    <input
                                                        type="text"
                                                        value={card.name}
                                                        onChange={(e) => {
                                                            const newCards = [...donationCards];
                                                            newCards[index].name = e.target.value;
                                                            setDonationCards(newCards);
                                                            setHasUnsavedCards(true);
                                                        }}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-2 px-3 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm"
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block mb-2">Description</label>
                                                    <input
                                                        type="text"
                                                        value={card.description}
                                                        onChange={(e) => {
                                                            const newCards = [...donationCards];
                                                            newCards[index].description = e.target.value;
                                                            setDonationCards(newCards);
                                                            setHasUnsavedCards(true);
                                                        }}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-2 px-3 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm"
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block mb-2">Price (USD)</label>
                                                    <input
                                                        type="number"
                                                        value={card.price}
                                                        onChange={(e) => {
                                                            const newCards = [...donationCards];
                                                            newCards[index].price = Number(e.target.value);
                                                            setDonationCards(newCards);
                                                            setHasUnsavedCards(true);
                                                        }}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-2 px-3 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm"
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block mb-2">Slug (URL)</label>
                                                    <input
                                                        type="text"
                                                        value={card.slug}
                                                        onChange={(e) => {
                                                            const newCards = [...donationCards];
                                                            newCards[index].slug = e.target.value;
                                                            setDonationCards(newCards);
                                                            setHasUnsavedCards(true);
                                                        }}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-2 px-3 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm"
                                                    />
                                                </div>
                                                <div className="mb-4 flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        id={`sponsored-${card.id}`}
                                                        checked={card.is_sponsored || false}
                                                        onChange={(e) => {
                                                            const newCards = [...donationCards];
                                                            newCards[index].is_sponsored = e.target.checked;
                                                            setDonationCards(newCards);
                                                            setHasUnsavedCards(true);
                                                        }}
                                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                    />
                                                    <label htmlFor={`sponsored-${card.id}`} className="text-[10px] font-black text-gray-700 uppercase tracking-widest cursor-pointer">
                                                        Mark as Sponsored
                                                    </label>
                                                </div>
                                                <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block mb-2">Sponsor Name (optional)</label>
                                                    <input
                                                        type="text"
                                                        value={card.sponsor_name || ''}
                                                        onChange={(e) => {
                                                            const newCards = [...donationCards];
                                                            newCards[index].sponsor_name = e.target.value;
                                                            if (e.target.value && !newCards[index].is_sponsored) {
                                                                newCards[index].is_sponsored = true;
                                                            }
                                                            setDonationCards(newCards);
                                                            setHasUnsavedCards(true);
                                                        }}
                                                        placeholder="e.g. The Cohen Family"
                                                        className="w-full bg-emerald-50 border border-emerald-100 rounded-xl py-2 px-3 text-gray-900 font-black focus:ring-2 focus:ring-emerald-500/50 focus:outline-none text-xs placeholder:text-emerald-300/60 mb-3"
                                                    />
                                                    
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block mb-2">Sponsorship Dedication/Label (optional)</label>
                                                    <input
                                                        type="text"
                                                        value={card.sponsored_label || ''}
                                                        onChange={(e) => {
                                                            const newCards = [...donationCards];
                                                            newCards[index].sponsored_label = e.target.value;
                                                            setDonationCards(newCards);
                                                            setHasUnsavedCards(true);
                                                        }}
                                                        placeholder="e.g. In Memory of..."
                                                        className="w-full bg-blue-50 border border-blue-100 rounded-xl py-2 px-3 text-gray-900 font-black focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-xs placeholder:text-blue-300/60"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={async () => {
                                                setIsLoading(true);
                                                try {
                                                    const res = await fetch('/api/admin', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            action: 'saveDonationCards',
                                                            cards: donationCards,
                                                        }),
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        setActionMessage('Donation cards saved successfully');
                                                        setHasUnsavedCards(false);
                                                    } else {
                                                        setActionMessage(data.error || 'Failed to save donation cards');
                                                    }
                                                } catch {
                                                    setActionMessage('Error saving donation cards');
                                                }
                                                setIsLoading(false);
                                            }}
                                            className={`h-14 px-8 ${currentTheme.bg} rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] hover:${currentTheme.bgDark} transition-all active:scale-95 shadow-lg ${currentTheme.shadow}`}
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* SETTINGS TAB */}
                            {activeTab === 'settings' && (
                                <div className="max-w-6xl mx-auto space-y-8">
                                    <div className="mb-8">
                                        <h2 className="text-4xl font-display font-black text-gray-900 tracking-tighter uppercase mb-2">Site Settings</h2>
                                        <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px]">Configure Platform Options</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* General Settings Card */}
                                        <div className="bg-gray-100 p-8 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">
                                            <div className={`absolute top-0 right-0 w-32 h-32 ${currentTheme.bgLight}/10 blur-[60px] -mr-16 -mt-16`} />
                                            <div className="mb-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`w-10 h-10 ${currentTheme.bg} rounded-xl flex items-center justify-center text-gray-900 shadow-lg ${currentTheme.shadow}`}>
                                                        <Icons.Dashboard />
                                                    </div>
                                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">General</h3>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Site Name</label>
                                                    <input
                                                        type="text"
                                                        value={settingsSiteName}
                                                        onChange={(e) => setSettingsSiteName(e.target.value)}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all placeholder:text-zinc-800"
                                                    />
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Contact Email</label>
                                                    <input
                                                        type="email"
                                                        value={settingsContactEmail}
                                                        onChange={(e) => setSettingsContactEmail(e.target.value)}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all placeholder:text-zinc-800"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Campaign Defaults Card */}
                                        <div className="bg-gray-100 p-8 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-[60px] -mr-16 -mt-16" />
                                            <div className="mb-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-gray-900 shadow-lg shadow-violet-600/20">
                                                        <Icons.Campaign />
                                                    </div>
                                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Campaign Defaults</h3>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Default Prize ($)</label>
                                                    <input
                                                        type="number"
                                                        value={settingsDefaultPrize}
                                                        onChange={(e) => setSettingsDefaultPrize(e.target.value)}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all placeholder:text-zinc-800"
                                                    />
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Default Goal ($)</label>
                                                    <input
                                                        type="number"
                                                        value={settingsDefaultGoal}
                                                        onChange={(e) => setSettingsDefaultGoal(e.target.value)}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all placeholder:text-zinc-800"
                                                    />
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Default Duration (days)</label>
                                                    <input
                                                        type="number"
                                                        value={settingsDefaultDuration}
                                                        onChange={(e) => setSettingsDefaultDuration(e.target.value)}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all placeholder:text-zinc-800"
                                                    />
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Currency</label>
                                                    <select
                                                        value={settingsCurrency}
                                                        onChange={(e) => setSettingsCurrency(e.target.value)}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all"
                                                    >
                                                        <option value="USD">USD - US Dollar</option>
                                                        <option value="EUR">EUR - Euro</option>
                                                        <option value="GBP">GBP - British Pound</option>
                                                        <option value="CAD">CAD - Canadian Dollar</option>
                                                        <option value="ILS">ILS - Israeli Shekel</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Commission Settings Card */}
                                        {isSuperAdmin && (
                                            <div className="bg-gray-100 p-8 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] -mr-16 -mt-16" />
                                                <div className="mb-6">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-gray-900 shadow-lg shadow-amber-500/20">
                                                            <span className="text-lg">💰</span>
                                                        </div>
                                                        <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Commission</h3>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="space-y-2 group">
                                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Platform Fee (%)</label>
                                                        <input
                                                            type="number"
                                                            value={settingsCommissionRate}
                                                            onChange={(e) => setSettingsCommissionRate(e.target.value)}
                                                            step="0.1"
                                                            min="0"
                                                            max="100"
                                                            className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all placeholder:text-zinc-800"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Email Settings Card */}
                                        <div className="bg-gray-100 p-8 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[60px] -mr-16 -mt-16" />
                                            <div className="mb-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-gray-900 shadow-lg shadow-rose-500/20">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                                    </div>
                                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Email & Notifications</h3>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Sender Email</label>
                                                    <input
                                                        type="email"
                                                        value={settingsEmailSender}
                                                        onChange={(e) => setSettingsEmailSender(e.target.value)}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all placeholder:text-zinc-800"
                                                    />
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Receipt Subject</label>
                                                    <input
                                                        type="text"
                                                        value={settingsReceiptSubject}
                                                        onChange={(e) => setSettingsReceiptSubject(e.target.value)}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all placeholder:text-zinc-800"
                                                    />
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Thank You Message</label>
                                                    <textarea
                                                        value={settingsThankYouMessage}
                                                        onChange={(e) => setSettingsThankYouMessage(e.target.value)}
                                                        rows={3}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all placeholder:text-zinc-800 resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Appearance Settings Card */}
                                        <div className="bg-gray-100 p-8 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[60px] -mr-16 -mt-16" />
                                            <div className="mb-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-gray-900 shadow-lg shadow-pink-500/20">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>
                                                    </div>
                                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Appearance</h3>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Theme</label>
                                                    <select
                                                        value={settingsTheme}
                                                        onChange={(e) => {
                                                            setSettingsTheme(e.target.value);
                                                            if (e.target.value === 'teal') {
                                                                setSettingsPrimaryColor('#14b8a6');
                                                                setSettingsSecondaryColor('#8b5cf6');
                                                            } else if (e.target.value === 'grey') {
                                                                setSettingsPrimaryColor('#6b7280');
                                                                setSettingsSecondaryColor('#9ca3af');
                                                            }
                                                        }}
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all"
                                                    >
                                                        <option value="teal">Teal (Default)</option>
                                                        <option value="grey">Grey</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Primary Color</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="color"
                                                            value={settingsPrimaryColor}
                                                            onChange={(e) => setSettingsPrimaryColor(e.target.value)}
                                                            className="w-12 h-10 rounded-lg border border-white/80 cursor-pointer"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={settingsPrimaryColor}
                                                            onChange={(e) => setSettingsPrimaryColor(e.target.value)}
                                                            className="flex-1 bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Secondary Color</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="color"
                                                            value={settingsSecondaryColor}
                                                            onChange={(e) => setSettingsSecondaryColor(e.target.value)}
                                                            className="w-12 h-10 rounded-lg border border-white/80 cursor-pointer"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={settingsSecondaryColor}
                                                            onChange={(e) => setSettingsSecondaryColor(e.target.value)}
                                                            className="flex-1 bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Logo URL</label>
                                                    <input
                                                        type="url"
                                                        value={settingsLogoUrl}
                                                        onChange={(e) => setSettingsLogoUrl(e.target.value)}
                                                        placeholder="https://example.com/logo.png"
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all placeholder:text-zinc-800"
                                                    />
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Favicon URL</label>
                                                    <input
                                                        type="url"
                                                        value={settingsFaviconUrl}
                                                        onChange={(e) => setSettingsFaviconUrl(e.target.value)}
                                                        placeholder="https://example.com/favicon.ico"
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all placeholder:text-zinc-800"
                                                    />
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}">Custom CSS</label>
                                                    <textarea
                                                        value={settingsCustomCss}
                                                        onChange={(e) => setSettingsCustomCss(e.target.value)}
                                                        rows={3}
                                                        placeholder="/* Add custom CSS here */"
                                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-3 px-4 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm transition-all placeholder:text-zinc-800 resize-none font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSaveSettings}
                                            disabled={isLoading}
                                            className="px-12 py-5 rounded-2xl ${currentTheme.bg} hover:${currentTheme.bgLight} text-gray-900 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl ${currentTheme.shadow} transition-all disabled:opacity-30 active:scale-[0.98]"
                                        >
                                            {isLoading ? 'SAVING...' : 'SAVE ALL SETTINGS'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* COMMISSION TAB */}
                            {activeTab === 'commission' && isSuperAdmin && (
                                <div className="max-w-4xl mx-auto space-y-10">
                                    <div className="bg-gray-100 p-12 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-64 h-64 ${currentTheme.bgLight}/10 blur-[80px] -mr-32 -mt-32`} />
                                        <div className="mb-12">
                                            <div className="flex items-center gap-6 mb-8">
                                                <div className={`w-16 h-16 ${currentTheme.bg} rounded-2xl flex items-center justify-center text-gray-900 text-2xl shadow-xl ${currentTheme.shadow} relative group`}>
                                                    <div className="absolute inset-0 bg-white/20 blur-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <span className="text-3xl">💰</span>
                                                </div>
                                                <div>
                                                    <h2 className="text-4xl font-display font-black text-gray-900 tracking-tighter uppercase mb-1">Commission Calculator</h2>
                                                    <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px]">5% Platform Fee on All Donations</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="bg-white/60 p-8 rounded-2xl border border-white/80 shadow-lg">
                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3">Total Donations Collected</p>
                                                <p className="text-5xl font-display font-black text-gray-900 tabular-nums tracking-tighter leading-none">
                                                    ${stats?.totalRaised?.toLocaleString() || 0}
                                                </p>
                                                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between text-[11px] font-black uppercase tracking-[0.2em]">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-emerald-600">Site (Banquest)</span>
                                                        <span className="text-2xl text-gray-900 tracking-tighter">${stats?.siteRaised?.toLocaleString() || 0}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 text-right">
                                                        <span className="text-blue-600">Admin (Manual)</span>
                                                        <span className="text-2xl text-gray-900 tracking-tighter">${stats?.adminRaised?.toLocaleString() || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`${currentTheme.bg} p-8 rounded-2xl border border-gray-500/30 shadow-xl ${currentTheme.shadow}`}>
                                                <p className={`text-[10px] font-black text-white uppercase tracking-[0.3em] mb-3`}>5% Commission Amount</p>
                                                <p className="text-5xl font-display font-black text-gray-900 tabular-nums tracking-tighter leading-none">
                                                    ${((stats?.siteRaised || 0) * 0.05).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-8 p-6 bg-gray-200/40 rounded-2xl border border-gray-200">
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] leading-relaxed">
                                                This represents 5% of donations collected via the site (Banquest). Manual admin donations are excluded from commission calculation.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ADMINS TAB */}
                            {activeTab === 'admins' && isSuperAdmin && (
                                <div className="max-w-4xl mx-auto space-y-10">
                                    <div className="bg-gray-100 p-12 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-64 h-64 ${currentTheme.bgLight}/10 blur-[80px] -mr-32 -mt-32`} />
                                        <div className="mb-12">
                                            <div className="flex items-center gap-6 mb-8">
                                                <div className={`w-16 h-16 ${currentTheme.bg} rounded-2xl flex items-center justify-center text-gray-900 text-2xl shadow-xl ${currentTheme.shadow} relative group`}>
                                                    <div className="absolute inset-0 bg-white/20 blur-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <Icons.Admins />
                                                </div>
                                                <div>
                                                    <h2 className="text-4xl font-display font-black text-gray-900 tracking-tighter uppercase mb-1">Team Management</h2>
                                                    <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px]">Authorize & Manage Team Members</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 bg-gray-200/40 p-8 rounded-2xl border border-gray-200">
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <div className="flex-1 group w-full">
                                                        <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block mb-3 transition-colors group-focus-within:${currentTheme.text}`}>Designated Email Identity</label>
                                                        <input
                                                            type="email"
                                                            value={newAdminEmail}
                                                            onChange={(e) => setNewAdminEmail(e.target.value)}
                                                            placeholder="personnel@donate.network"
                                                            className="w-full bg-white/60 border border-white/80 rounded-xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                                        />
                                                    </div>
                                                    <div className="flex-1 group w-full">
                                                        <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block mb-3 transition-colors group-focus-within:${currentTheme.text}`}>Password</label>
                                                        <input
                                                            type="password"
                                                            value={newAdminPassword}
                                                            onChange={(e) => setNewAdminPassword(e.target.value)}
                                                            placeholder="••••••••"
                                                            className="w-full bg-white/60 border border-white/80 rounded-xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleInviteAdmin}
                                                    disabled={isLoading || !newAdminEmail || !newAdminPassword}
                                                    className={`w-full px-10 py-5 rounded-xl ${currentTheme.bg} hover:${currentTheme.bgLight} text-gray-900 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl ${currentTheme.shadow} transition-all disabled:opacity-30 active:scale-[0.98]`}
                                                >
                                                    {isLoading ? 'SYNCING...' : 'AUTHORIZE KEY'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.4em]">Active Access Nodes</h3>
                                                <div className="h-px flex-1 bg-white/60 mx-6" />
                                                <span className={`text-[10px] font-black ${currentTheme.text} uppercase tracking-widest ${currentTheme.bgLight}/10 px-3 py-1 rounded-full border border-gray-500/20`}>
                                                    {(stats as any)?.authorizedAdmins?.length || 0} TOTAL
                                                </span>
                                            </div>

                                            <div className="grid gap-3">
                                                {(stats as any)?.authorizedAdmins?.map((admin: any) => (
                                                    <div key={admin.email} className="flex items-center justify-between p-6 bg-white/[0.02] border border-gray-200 rounded-2xl hover:bg-white/[0.04] transition-all group">
                                                        <div className="flex items-center gap-5">
                                                            <div className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-600 text-xs font-black border border-gray-200 group-hover:border-gray-500/50 group-hover:${currentTheme.text} transition-all`}>
                                                                {admin.email.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-gray-900 uppercase tracking-widest">{admin.email}</p>
                                                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Added {new Date(admin.created_at).toLocaleDateString()}</p>
                                                                {admin.email === 'admin@donateateret.com' && (
                                                                    <span className="ml-2 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-widest">Master Key</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {admin.email !== 'admin@donateateret.com' && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditAdmin(admin.email)}
                                                                    className={`px-4 py-2 rounded-lg bg-gray-100 ${currentTheme.text} text-[9px] font-black uppercase tracking-widest border border-gray-500/10 hover:${currentTheme.bgLight} hover:text-gray-900 transition-all`}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemoveAdmin(admin.email)}
                                                                    className="px-4 py-2 rounded-lg bg-red-100 text-rose-500 text-[9px] font-black uppercase tracking-widest border border-rose-500/10 hover:bg-rose-500 hover:text-gray-900 transition-all"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="p-8 bg-gray-200/20 rounded-2xl border border-gray-200 flex gap-6 mt-12 items-start">
                                                <div className={`${currentTheme.text} mt-1`}>
                                                    <Icons.Shield />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-gray-900 text-[11px] font-black uppercase tracking-widest">Protocol Warning</p>
                                                    <p className="text-gray-600 text-[11px] font-bold leading-relaxed">
                                                        Authorizing new users grants them read/write access to the Ledger and Campaign matrix. Every successful login is logged as a permanent system event. Access can be revoked instantly from this panel.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Edit Admin Password Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-100 rounded-3xl p-10 max-w-md w-full shadow-2xl border border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-2">Edit Admin</h2>
                            <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-8">
                                Update admin credentials
                            </p>
                            <div className="space-y-6">
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Email</label>
                                    <input
                                        type="email"
                                        value={editingAdminNewEmail}
                                        onChange={(e) => setEditingAdminNewEmail(e.target.value)}
                                        placeholder="admin@example.com"
                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>New Password (optional)</label>
                                    <input
                                        type="password"
                                        value={editingAdminPassword}
                                        onChange={(e) => setEditingAdminPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white/60 border border-white/80 rounded-xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 py-4 rounded-xl bg-white text-zinc-950 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all border border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateAdmin}
                                        disabled={isLoading || !editingAdminNewEmail}
                                        className={`flex-1 py-4 rounded-xl ${currentTheme.bg} hover:${currentTheme.bgLight} text-gray-900 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl ${currentTheme.shadow} transition-all disabled:opacity-30`}
                                    >
                                        {isLoading ? 'SYNCING...' : 'Update Admin'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notifications */}
            <AnimatePresence>
                {actionMessage && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, y: 0 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed bottom-10 right-10 bg-gray-100/95 backdrop-blur-3xl text-gray-900 px-8 py-6 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)] z-[100] border border-white/80 font-black flex items-center gap-6 min-w-[420px] ring-1 ring-white/5"
                    >
                        <div className={`w-14 h-14 rounded-xl ${currentTheme.bgLight}/10 border border-gray-500/20 flex items-center justify-center ${currentTheme.text} text-2xl`}>
                            <Icons.Shield />
                        </div>
                        <div className="flex-1">
                            <p className={`text-[11px] ${currentTheme.text} font-black uppercase tracking-[0.4em] leading-none mb-2`}>System Telemetry</p>
                            <p className="text-sm text-gray-900 font-bold tracking-tight">{actionMessage}</p>
                        </div>
                        <button onClick={() => setActionMessage('')} className="w-10 h-10 rounded-xl hover:bg-white/60 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showManualDonationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
                        onClick={() => setShowManualDonationModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-100 rounded-[40px] p-12 max-w-md w-full shadow-2xl border border-white/80"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">Record Donation</h2>
                            <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-8">
                                Manually synchronize external contribution.
                            </p>
                            <div className="space-y-6">
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Donor Name</label>
                                    <input
                                        type="text"
                                        value={manualDonorName}
                                        onChange={(e) => setManualDonorName(e.target.value)}
                                        placeholder="Full Name"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Donor Email (optional)</label>
                                    <input
                                        type="email"
                                        value={manualDonorEmail}
                                        onChange={(e) => setManualDonorEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Amount (USD)</label>
                                    <input
                                        type="number"
                                        value={manualDonorAmount}
                                        onChange={(e) => setManualDonorAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setShowManualDonationModal(false)}
                                        className="flex-1 py-5 rounded-2xl bg-white text-zinc-950 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all border border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddManualDonation}
                                        disabled={isLoading || !manualDonorName || !manualDonorAmount}
                                        className={`flex-1 py-5 rounded-2xl ${currentTheme.bg} hover:${currentTheme.bgDark} text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl ${currentTheme.shadow} transition-all disabled:opacity-30`}
                                    >
                                        {isLoading ? 'SYNCING...' : 'Confirm Sync'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Purpose Donation Modal */}
            <AnimatePresence>
                {showPurposeDonationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
                        onClick={() => setShowPurposeDonationModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-100 rounded-[40px] p-8 max-w-md w-full shadow-2xl border border-white/80"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-2">Add Purpose Donation</h2>
                            <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-6">
                                Record donation for a specific purpose.
                            </p>
                            <div className="space-y-4">
                                <div className="space-y-2 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Donor Name</label>
                                    <input
                                        type="text"
                                        value={purposeDonorName}
                                        onChange={(e) => setPurposeDonorName(e.target.value)}
                                        placeholder="Full Name"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-3 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-base transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Donor Email (optional)</label>
                                    <input
                                        type="email"
                                        value={purposeDonorEmail}
                                        onChange={(e) => setPurposeDonorEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-3 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-base transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Amount (USD)</label>
                                    <input
                                        type="number"
                                        value={purposeDonorAmount}
                                        onChange={(e) => setPurposeDonorAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-3 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-base transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Purpose</label>
                                    <select
                                        value={purposeDonorPurpose}
                                        onChange={(e) => setPurposeDonorPurpose(e.target.value)}
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-3 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-base transition-all"
                                    >
                                        <option value="">Select purpose</option>
                                        {donationCards.map((card) => (
                                            <option key={card.id} value={card.slug}>
                                                {card.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Note (optional)</label>
                                    <input
                                        type="text"
                                        value={purposeDonorNote}
                                        onChange={(e) => setPurposeDonorNote(e.target.value)}
                                        placeholder="e.g., Refuah Shelemah, Leilui Nishmat..."
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-3 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-base transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setShowPurposeDonationModal(false)}
                                        className="flex-1 py-5 rounded-2xl bg-white text-zinc-950 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all border border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddPurposeDonation}
                                        disabled={isLoading || !purposeDonorName || !purposeDonorAmount || !purposeDonorPurpose}
                                        className={`flex-1 py-5 rounded-2xl ${currentTheme.bg} hover:${currentTheme.bgDark} text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl ${currentTheme.shadow} transition-all disabled:opacity-30`}
                                    >
                                        {isLoading ? 'ADDING...' : 'Add Donation'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtract Donation Modal */}
            <AnimatePresence>
                {showSubtractDonationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
                        onClick={() => setShowSubtractDonationModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-100 rounded-[40px] p-12 max-w-md w-full shadow-2xl border border-white/80"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-3xl font-black text-red-600 tracking-tighter uppercase mb-2">Subtract Donation</h2>
                            <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-8">
                                Remove funds from total raised.
                            </p>
                            <div className="space-y-6">
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:text-red-600`}>Donor Name</label>
                                    <input
                                        type="text"
                                        value={subtractDonorName}
                                        onChange={(e) => setSubtractDonorName(e.target.value)}
                                        placeholder="Full Name"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-red-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:text-red-600`}>Donor Email (optional)</label>
                                    <input
                                        type="email"
                                        value={subtractDonorEmail}
                                        onChange={(e) => setSubtractDonorEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-red-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:text-red-600`}>Amount to Subtract (USD)</label>
                                    <input
                                        type="number"
                                        value={subtractDonorAmount}
                                        onChange={(e) => setSubtractDonorAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-red-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:text-red-600`}>Note (optional)</label>
                                    <input
                                        type="text"
                                        value={subtractDonorNote}
                                        onChange={(e) => setSubtractDonorNote(e.target.value)}
                                        placeholder="Reason for subtraction"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-red-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setShowSubtractDonationModal(false)}
                                        className="flex-1 py-5 rounded-2xl bg-white text-zinc-950 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all border border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubtractDonation}
                                        disabled={isLoading || !subtractDonorName || !subtractDonorAmount}
                                        className="flex-1 py-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-red-600/30 transition-all disabled:opacity-30"
                                    >
                                        {isLoading ? 'SUBTRACTING...' : 'Subtract'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Donation Modal */}
            <AnimatePresence>
                {showEditDonationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
                        onClick={() => setShowEditDonationModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-100 rounded-[40px] p-12 max-w-md w-full shadow-2xl border border-white/80"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">Edit Donation</h2>
                            <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-8">
                                Modify donation details.
                            </p>
                            <div className="space-y-6">
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Donor Name</label>
                                    <input
                                        type="text"
                                        value={editDonorName}
                                        onChange={(e) => setEditDonorName(e.target.value)}
                                        placeholder="Full Name"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Donor Email (optional)</label>
                                    <input
                                        type="email"
                                        value={editDonorEmail}
                                        onChange={(e) => setEditDonorEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Amount (USD)</label>
                                    <input
                                        type="number"
                                        value={editDonorAmount}
                                        onChange={(e) => setEditDonorAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Note (optional)</label>
                                    <input
                                        type="text"
                                        value={editDonorNote}
                                        onChange={(e) => setEditDonorNote(e.target.value)}
                                        placeholder="Donation note"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-3 group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block transition-colors group-focus-within:${currentTheme.text}`}>Purpose (optional)</label>
                                    <input
                                        type="text"
                                        value={editDonorPurpose}
                                        onChange={(e) => setEditDonorPurpose(e.target.value)}
                                        placeholder="Donation purpose"
                                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-lg transition-all placeholder:text-zinc-400"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setShowEditDonationModal(false)}
                                        className="flex-1 py-5 rounded-2xl bg-white text-zinc-950 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all border border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEditDonation}
                                        disabled={isLoading || !editDonorName || !editDonorAmount}
                                        className={`flex-1 py-5 rounded-2xl ${currentTheme.bg} hover:${currentTheme.bgDark} text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl ${currentTheme.shadow} transition-all disabled:opacity-30`}
                                    >
                                        {isLoading ? 'SAVING...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recipient Modal */}
            <AnimatePresence>
                {showWinnerModal && winner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-200/95 backdrop-blur-3xl p-6"
                        onClick={() => setShowWinnerModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-gray-100 rounded-[40px] p-16 max-w-2xl w-full text-center shadow-[0_0_100px_rgba(20,184,166,0.15)] relative overflow-hidden border border-white/80"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
                            <div className={`absolute top-0 right-0 w-64 h-64 ${currentTheme.bgLight}/10 blur-[120px] -mr-32 -mt-32`} />
                            
                            <div className="relative z-10">
                                <motion.div 
                                    className="text-8xl mb-12"
                                    animate={{ 
                                        y: [0, -15, 0],
                                        rotate: [0, -5, 5, 0]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    💎
                                </motion.div>
                                <h3 className="text-5xl font-black text-gray-900 tracking-tighter uppercase mb-2">Operational Victory</h3>
                                <p className="text-gray-600 font-black text-[10px] uppercase tracking-[0.4em] mb-16">Verified Settlement Protocol Complete</p>

                                <div className="bg-white/60 rounded-[40px] p-12 mb-12 border border-gray-200 relative group overflow-hidden">
                                     <div className={`absolute inset-0 ${currentTheme.bgLight}/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                                     <div className="relative z-10">
                                        <p className={`text-[10px] font-black ${currentTheme.text} uppercase tracking-[0.3em] mb-4`}>Identity Authorization</p>
                                        <p className="text-5xl font-black text-gray-900 tracking-tighter mb-2">{winner.name}</p>
                                        <p className="text-gray-600 font-black uppercase text-[10px] tracking-widest mb-10">{winner.email}</p>

                                        <div className="flex items-center justify-center gap-6">
                                            <div className="bg-gray-200/40 px-8 py-6 rounded-2xl border border-gray-200 flex flex-col items-center">
                                                <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest mb-2">Winner</p>
                                                <p className={`text-3xl font-mono font-black ${currentTheme.text} tracking-tighter`}>{winner.name}</p>
                                            </div>
                                            <div className={`${currentTheme.bg} px-8 py-6 rounded-2xl border border-white/80 flex flex-col items-center shadow-xl ${currentTheme.shadow}`}>
                                                <p className="text-white text-[9px] font-black uppercase tracking-widest mb-2">Settlement</p>
                                                <p className="text-3xl font-display font-black text-gray-900 tracking-tighter tabular-nums">${winner.amount}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowWinnerModal(false)}
                                    className="w-full py-7 rounded-2xl bg-white text-zinc-950 font-black text-sm uppercase tracking-[0.5em] transition-all hover:bg-zinc-200 active:scale-[0.98] shadow-xl"
                                >
                                    Terminate Sequence
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Edit Fundraiser Modal */}
            <AnimatePresence>
                {showFundraiserEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowFundraiserEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-10">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Edit Fundraiser</h3>
                                <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Adjust personal page details.</p>
                            </div>

                            <div className="space-y-8">
                                <div className="group">
                                    <label className={`text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] block mb-3 group-focus-within:${currentTheme.text}`}>Full Name</label>
                                    <input
                                        type="text"
                                        value={editFundraiserName}
                                        onChange={(e) => setEditFundraiserName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-gray-900 font-black focus:ring-2 focus:ring-gray-500/50 focus:outline-none text-sm"
                                    />
                                </div>
                                <div className="flex gap-4 mt-12">
                                    <button
                                        onClick={() => setShowFundraiserEditModal(false)}
                                        className="flex-1 py-5 rounded-xl bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-[0.3em]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateFundraiser}
                                        className={`flex-1 py-5 rounded-xl ${currentTheme.bg} text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-teal-600/20`}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
