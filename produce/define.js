import { PageEnums } from "@/utils/config";

export const TabList = [
  {
    label: "生产看版",
    path: PageEnums.produce,
    roles: ["PRODUCE_STATISTICS"],
  },
  {
    label: "员工管理",
    path: PageEnums.produceStaff,
    roles: ["STAFF_LIST"],
  },
  {
    label: "生产工单",
    path: PageEnums.produceWorkList,
    roles: ["PRODUCE_PENDING", "PRODUCE_LIST", "PRODUCE_HISTORY"],
  },
  {
    label: "生产流程",
    path: PageEnums.factory,
    roles: ["CRAFT_WORKING_LIST", "CRAFT_WAIT_CONFIRM", "CRAFT_SETTLED"],
  },
  {
    label: "我的工资",
    path: PageEnums.salary,
    roles: ["CRAFT_MY_SALARY", "CRAFT_MY_MONTH", "CRAFT_MY_WORKING", "CRAFT_WAIT_MY_CONFIRM", "CRAFT_MY_SETTLED"],
  },
];
