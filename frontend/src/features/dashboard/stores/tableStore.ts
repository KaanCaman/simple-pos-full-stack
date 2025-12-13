import { makeObservable, observable, action, runInAction } from "mobx";
import { tableService } from "../services/tableService";
import type {
  Table,
  CreateTableRequest,
  UpdateTableRequest,
} from "../../../types/operation";
import { logger } from "../../../utils/logger";
import { RootStore } from "../../../stores/rootStore";

export class TableStore {
  @observable tables: Table[] = [];
  @observable isLoading: boolean = false;
  @observable error: string | null = null;

  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeObservable(this);
  }

  @action
  async fetchTables() {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await tableService.getTables();
      runInAction(() => {
        this.tables = response.data.data;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message || "Failed to fetch tables";
        logger.error("Failed to fetch tables", { error }, "TableStore");
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async createTable(data: CreateTableRequest) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await tableService.createTable(data);
      runInAction(() => {
        this.tables.push(response.data.data);
        logger.info(
          "Table created",
          { table: response.data.data },
          "TableStore"
        );
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message || "Failed to create table";
        logger.error("Failed to create table", { error }, "TableStore");
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async updateTable(id: number, data: UpdateTableRequest) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await tableService.updateTable(id, data);
      runInAction(() => {
        // Since backend only returns "Table updated" message and data inside data object
        // We might need to verify what exactly backend returns.
        // Assuming backend returns the updated table in `data` field based on previous pattern
        const updatedTable = response.data.data;
        const index = this.tables.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.tables[index] = updatedTable;
        }
        logger.info("Table updated", { id }, "TableStore");
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message || "Failed to update table";
        logger.error("Failed to update table", { error }, "TableStore");
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async deleteTable(id: number) {
    this.isLoading = true;
    this.error = null;
    try {
      await tableService.deleteTable(id);
      runInAction(() => {
        this.tables = this.tables.filter((t) => t.id !== id);
        logger.info("Table deleted", { id }, "TableStore");
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message || "Failed to delete table";
        logger.error("Failed to delete table", { error }, "TableStore");
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}
