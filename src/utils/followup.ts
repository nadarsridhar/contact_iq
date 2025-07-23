export interface IFollowup {
  AttendedId: "";
  AttendedName: "";
  BranchName: "MAIN BRANCH";
  ClientId: "XYZ";
  ClientName: "D'SZA";
  CreatedDate: 1750057084175;
  Description: "desc40";
  EndTime: 1750057103;
  FollowUpTime: 1750057102;
  LastUpdateDate: 0;
  Priority: 0;
  Reason: "";
  StartTime: 1750012200;
  Status: 2;
  TagId: 0;
  TaskType: 2;
  TemplateId: "";
  Title: "TEST42";
  UUID: "91e67d4e-787c-41aa-8132-a3a097a4914c";
  UpdatedBy: "DEALER1";
  UserId: "DEALER1";
  UserName: "VR";
}

export enum TaskStatus {
  NotReady, // before start time
  Ready, // after start time
  Todo, // task taken by user
  FollowUp,
  InProgress, // task started
  Completed, // task completed
  Cancelled,
  Expired,
}

export enum TaskType {
  CallQueue = 1,
  CallReminder,
}

export enum TaskPriority {
  Low,
  Medium,
  High,
  Urgent,
}

export function getTaskStatusName(taskStatus: TaskStatus) {
  switch (taskStatus) {
    case TaskStatus.Todo:
      return "Todo";

    case TaskStatus.FollowUp:
      return "Scheduled";

    case TaskStatus.Completed:
      return "Completed";

    case TaskStatus.Cancelled:
      return "Cancelled";
  }
}
