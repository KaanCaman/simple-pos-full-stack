import { makeObservable, observable, action } from "mobx";
import { RootStore } from "./rootStore";

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel?: () => void;
}

export class UiStore {
  @observable confirmation: ConfirmationOptions | null = null;
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeObservable(this);
  }

  @action
  showConfirmation(options: ConfirmationOptions) {
    this.confirmation = options;
  }

  @action
  closeConfirmation() {
    this.confirmation = null;
  }
}
