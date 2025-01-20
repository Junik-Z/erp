import { PageEnums } from "@/utils/config";

export const TabList = [
  {
    label: "生产看版",
    path: PageEnums.produce,
    roles: ["Produce_Read", "Produce_Write"],
  },
  {
    label: "员工管理",
    path: PageEnums.produceStaff,
    roles: ["Produce_Read", "Produce_Write"],
  },
  {
    label: "生产工单",
    path: PageEnums.produceWorkList,
    roles: ["Produce_Read", "Produce_Write"],
  },
  {
    label: "生产流程",
    path: PageEnums.factory,
    roles: ["Produce_Read", "Produce_Write"],
  },
  {
    label: "我的工资",
    path: PageEnums.salary,
    roles: ["Produce_Member"],
  },
];
