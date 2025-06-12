<script>
import KoList from "@/components/List/List.vue";
import { getAllRecordsListApi } from "@/api/erp/attend";
import mixins from "@/mixins/mixins";
import PickerDate from "./components/PickerDate.vue";
import { _deepCopy, _get, _groupBy, _isEqual, _omit } from "@/utils";
import dayjs from "@/utils/dayjs";

export default {
  name: "record",
  components: {KoList, PickerDate},
  mixins: [mixins],
  data() {
    return {
      loading: false,
      noMore: false,
      list: [],

      queryList: {
        time: +new Date(),
      },

      monthList: [],
      groupList: {},
    };
  },
  onLoad() {
    this.getList(true);
  },
  onReachBottom() {
    this.onRequestNextPage();
  },
  methods: {
    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset = false) {
      if (reset) {
        this.list = [];
        this.tableKey = +new Date();
        this.noMore = false;
      }
      const params = _deepCopy(this.queryList);
      const time = dayjs(params.time);

      this.loading = true;
      this.monthList = [];

      getAllRecordsListApi({
        ..._omit(params, ["time"]),
        year: time.year(),
        month: time.month() + 1,
      })
        .then(res => {
          this.list = res.data;
          this.groupList = _groupBy(this.list, (item) => item.staffId);

          const maxDate = time.endOf("M").date();
          for (let i = 1; i <= maxDate; i++) this.monthList.push(i);

          this.noMore = true;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  computed: {
    // #ifdef H5
    getColumns() {
      return [
        {
          label: "姓名",
          prop: "staffName",
        },
        {
          label: "",
          prop: "",
        },
        ...(this.monthList.map(label => ({label, value: label}))),
      ];
    },
    // #endif

    // 获取员工姓名
    getStaffName() {
      return (key) => {
        return _get(this.groupList, `${key}.0.staffName`) + `   (${_get(this.groupList, key).length}天)`;
      };
    },

    // 获取单元格的分配
    getGridTemplateColumnsStyle() {
      return {
        "--ko-basic-table-grid-col": "auto ".repeat(10).trim(),
      };
    },

    getItemClass() {
      return (list, date) => {
        const node = list.find(n => _isEqual(dayjs(n.date).date(), date)) || {};

        let classList = [];

        // 上班打卡
        if (node.amSignInSuccess) {
          classList.push("sign-in");
        }
        // 下班打卡
        if (node.pmSignInSuccess) {
          classList.push("sign-out");
        }
        // 迟到打卡
        if (node.isLate) {
          classList.push("is-late");
        }
        // 早退打卡
        if (node.isLeaveEarly) {
          classList.push("is-leave-early");
        }

        return classList.join(" ");
      };
    },

    getTimeHHmm() {
      return (time) => {
        if (!time) return "";
        return time?.split(".")?.[0] || "";
      };
    },
  },
};
</script>

<template>
  <view class="ko-record">
    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->
    <view style="padding: 10px;">
      <PickerDate
        mode="year-month"
        :to-format-value="false"
        v-model="queryList.time"
        @change="getList(true)"
        format="YYYY-MM"
      />
    </view>
    <!-- #ifdef MP | H5 -->
    <view>
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view :style="[getGridTemplateColumnsStyle]">
          <block v-for="(child, key) of groupList" :key="key">
            <uni-section :title="getStaffName(key)" type="line">
              <view style="padding: 10px;">
                <view class="ko-basic-table">
                  <view class="ko-basic-table--cell" v-for="(item, index) of monthList" :key="index">
                    <view :class="[getItemClass(child, item)]">
                      <view class="ko-record__day">{{ item }}</view>
                      <view class="ko-record__info">
                        <text class="ko-record__info--item in">上</text>
                        <text class="ko-record__info--item out">下</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </uni-section>
          </block>
        </view>


        <view v-if="false" style="padding: 5px 10px" v-for="(item, index) of list" :key="item.id">
          <BasicCard>
            <view class="ko-record__info">
              <uni-row gutter="10">
                <uni-col :span="24">
                  <label class="ko-basic-label">日期：</label>
                  <text>{{ item.date }}</text>
                </uni-col>
                <uni-col :span="24">
                  <label class="ko-basic-label">员工：</label>
                  <text>{{ item.staffName }}</text>
                </uni-col>
                <!-- <uni-col :span="12">
                   <label class="ko-basic-label">上班时间：</label>
                   <text>{{ getTimeHHmm(item.signInTime) || "-" }}</text>
                 </uni-col>
                 <uni-col :span="12">
                   <label class="ko-basic-label">下班时间：</label>
                   <text>{{ getTimeHHmm(item.signOutTime) || "-" }}</text>
                 </uni-col>-->
                <uni-col :span="12">
                  <label class="ko-basic-label">是否迟到：</label>
                  <text>{{ item.isLate ? "是" : "否" }}</text>
                </uni-col>
                <uni-col :span="12">
                  <label class="ko-basic-label">是否早退：</label>
                  <text>{{ item.isLeaveEarly ? "是" : "否" }}</text>
                </uni-col>
              </uni-row>
            </view>
          </BasicCard>
        </view>
      </KoList>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
   <!-- <view style="padding: 10px;">
      <KoTable
        :loading="loading"
        :columns="getColumns"
        :data="list"
        empty-text="暂无数据"
        stripe

        @load-next="onRequestNextPage"
        :no-more="noMore || loading"
      />
    </view>-->
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
.ko-record {
  &__info {
    font-size: 14px;
    color: $uni-base-color;
  }

  &__day {
    font-size: 14px;
    font-weight: bold;
  }

  &__info {
    display: flex;

    &--item {
      padding: 2px;
      border-radius: 50%;
      font-size: 10px;
    }
  }

  // 上下班正常打卡
  .sign-in .in, .sign-out .out {
    color: #18bc37;
    font-weight: bold;
  }

  // 迟到早退打卡
  .is-late .in, .is-leave-early .out {
    color: #e43d33;
    font-weight: bold;
  }
}
</style>
