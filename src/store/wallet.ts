import { create } from 'zustand';
import type { GrabitWallet } from '@gradient365/gradient-commons';

interface WalletState {
  baseBalancePaise: number;
  bonusBalancePaise: number;
  referralCode: string | null;
  streakMonths: number;
  autoRechargeEnabled: boolean;
  autoRechargeThresholdPaise: number;
  loaded: boolean;
  setWallet: (wallet: GrabitWallet) => void;
  incrementBalance: (basePaise: number, bonusPaise: number) => void;
  reset: () => void;
}

export const useWallet = create<WalletState>()((set) => ({
  baseBalancePaise: 0,
  bonusBalancePaise: 0,
  referralCode: null,
  streakMonths: 0,
  autoRechargeEnabled: false,
  autoRechargeThresholdPaise: 10000,
  loaded: false,

  setWallet: (wallet: GrabitWallet) =>
    set({
      baseBalancePaise: wallet.base_balance_paise,
      bonusBalancePaise: wallet.bonus_balance_paise,
      referralCode: wallet.referral_code,
      streakMonths: wallet.recharge_streak_months,
      autoRechargeEnabled: wallet.auto_recharge_enabled,
      autoRechargeThresholdPaise: wallet.auto_recharge_threshold_paise,
      loaded: true,
    }),

  incrementBalance: (basePaise: number, bonusPaise: number) =>
    set((state) => ({
      baseBalancePaise: state.baseBalancePaise + basePaise,
      bonusBalancePaise: state.bonusBalancePaise + bonusPaise,
    })),

  reset: () =>
    set({
      baseBalancePaise: 0,
      bonusBalancePaise: 0,
      referralCode: null,
      streakMonths: 0,
      autoRechargeEnabled: false,
      autoRechargeThresholdPaise: 10000,
      loaded: false,
    }),
}));
