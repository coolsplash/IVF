import { Donation, RaffleState } from '@/types';

// In-memory store
// This persists across API calls within the same server instance

class DataStore {
    private donations: Donation[] = [];
    private raffle: RaffleState = {
        prizeAmount: 7000,
        goalAmount: 10000,
        drawingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        isActive: true,
        winner: null,
    };

    // Seed some demo data
    constructor() {
        const demoNames = [
            'Sarah M.', 'David K.', 'Rachel B.', 'Michael L.',
            'Leah S.', 'Aaron G.', 'Miriam T.', 'Josh R.',
            'Hannah P.', 'Daniel F.', 'Rebecca A.', 'Noah C.',
        ];

        const now = Date.now();

        for (let i = 0; i < 12; i++) {
            const amount = Math.floor(Math.random() * 250) + 5;
            this.donations.push({
                id: `demo-${i}`,
                name: demoNames[i],
                email: `${demoNames[i].toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
                amount,
                timestamp: new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            });
        }

    }

    addDonation(donation: Donation): void {
        this.donations.push(donation);
    }

    getDonations(): Donation[] {
        return [...this.donations].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }

    getRecentDonations(limit: number = 10): Donation[] {
        return this.getDonations().slice(0, limit);
    }

    getTotalRaised(): number {
        return this.donations.reduce((sum, d) => sum + d.amount, 0);
    }

    getTotalDonations(): number {
        return this.donations.length;
    }

    getTopDonors(limit: number = 10): { name: string; total: number }[] {
        const donorMap = new Map<string, number>();
        this.donations.forEach((d) => {
            const current = donorMap.get(d.name) || 0;
            donorMap.set(d.name, current + d.amount);
        });
        return Array.from(donorMap.entries())
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);
    }

    getRaffle(): RaffleState {
        return { ...this.raffle };
    }

    updateRaffle(updates: Partial<RaffleState>): void {
        this.raffle = { ...this.raffle, ...updates };
    }

    selectWinner(): Donation | null {
        if (this.donations.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.donations.length);
        const winner = this.donations[randomIndex];
        this.raffle.winner = {
            name: winner.name,
            email: winner.email,
            amount: winner.amount,
        };
        this.raffle.isActive = false;
        return winner;
    }

    resetRaffle(newPrizeAmount: number, newGoalAmount: number, newDrawingDate: string): void {
        this.raffle = {
            prizeAmount: newPrizeAmount,
            goalAmount: newGoalAmount,
            drawingDate: newDrawingDate,
            isActive: true,
            winner: null,
        };
    }

    getTodayStats(): { count: number; amount: number } {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayDonations = this.donations.filter(
            (d) => new Date(d.timestamp) >= today
        );
        return {
            count: todayDonations.length,
            amount: todayDonations.reduce((sum, d) => sum + d.amount, 0),
        };
    }

}

// Singleton
const globalStore = globalThis as unknown as { __dataStore: DataStore };
if (!globalStore.__dataStore) {
    globalStore.__dataStore = new DataStore();
}

export const dataStore = globalStore.__dataStore;
