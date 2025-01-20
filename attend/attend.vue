<script>
import dayjs from "@/utils/dayjs";
import UniCalendar from "./components/uni-calendar/components/uni-calendar/uni-calendar.vue";
import { checkinApi, getAttendanceListApi, getAttendanceSettingApi, settingApi } from "@/api/erp/attend";
import { PageEnums } from "@/utils/config";
import PickerDate from "@/attend/components/PickerDate.vue";
import { _deepCopy, _pick, CustomToast } from "@/utils";
import mixins from "@/mixins/mixins";

const day = dayjs();

export default {
  name: "attend",
  components: {PickerDate, UniCalendar},
  data() {
    return {
      date: {
        h: 0,
        m: 0,
        time: "",
      },
      timeVM: null,

      attendQuery: {
        year: day.year(),
        month: day.month() + 1,
        pageNum: 0,
        pageSize: 31,
      },

      visible: false,
      form: {
        morningCheckInTime: "",
        afternoonCheckOutTime: "",
      },

      sLoading: false,

      MyToday: {},

      list: [],
    };
  },
  onLoad() {
    this.getSetting();
    this.updateTime();
    this.getAttendList();
  },
  mixins: [mixins],
  methods: {
    // 更新时间
    updateTime() {
      this.timeVM = setTimeout(() => {
        const day = dayjs();
        const [h, m] = day.format("HH:mm").split(":");
        this.date.h = h;
        this.date.m = m;
        this.date.time = day;

        this.updateTime();
      }, 100);
    },

    // 获取考勤配置
    getSetting() {
      getAttendanceSettingApi()
        .then(res => {
          const p = res.data;
          p.morningCheckInTime = p.morningCheckInTime ? p.morningCheckInTime.split(":").slice(0, -1).join(":") : "";
          p.afternoonCheckOutTime = p.afternoonCheckOutTime ? p.afternoonCheckOutTime.split(":").slice(0, -1).join(":") : "";

          this.form = res.data;
        });
    },

    // 获取我的考勤列表
    getAttendList() {
      getAttendanceListApi(this.attendQuery)
        .then(res => {
          console.log("考勤记录", res.data);
          const data = res.data;

          // 获取今天的记录
          this.MyToday = data.find(v => v.date ? dayjs().isSame(dayjs(v.date), "d") : false) || this.MyToday;
          this.list = data;
        });
    },

    // 切换年月
    onMonthSwitch(data) {
      console.log(data);
      this.attendQuery = data;
      this.getAttendList();
    },

    // 跳转到考勤记录
    onJumpRecord() {
      uni.navigateTo({
        url: PageEnums.attendRecord,
      });
    },

    // 开启设置考勤
    onSetCheckIn() {
      this.visible = true;
    },

    // 修改打卡时间
    onSubmit() {
      const {morningCheckInTime, afternoonCheckOutTime} = _deepCopy(this.form) || {};
      if (morningCheckInTime && afternoonCheckOutTime) {
        if (dayjs(`2025-01-01 ${morningCheckInTime}`).isBefore(dayjs(`2025-01-01 ${afternoonCheckOutTime}`), "s")) {
          // const s = (morningCheckInTime ? morningCheckInTime.split(":") : []).map(_toFinite);
          // const e = (afternoonCheckOutTime ? afternoonCheckOutTime.split(":") : []).map(_toFinite);
          const params = {
            ..._pick(this.form, ["id", "morningCheckInTime", "afternoonCheckOutTime"]),
            /*  morningCheckInTime: {
               hour: s[0],
               minute: s[1],
               second: 0,
               nano: 0,
             },
             afternoonCheckOutTime: {
               hour: e[0],
               minute: e[1],
               second: 0,
               nano: 0,
             }, */
          };

          this.sLoading = true;
          settingApi(params)
            .then(() => {
              this.getSetting();
              CustomToast({
                title: "修改成功",
              });
            })
            .finally(() => {
              this.sLoading = false;
              this.visible = false;
            });

        } else {
          CustomToast({
            title: "下班时间不能早于上班时间",
            icon: "none",
          });
        }
      } else {
        CustomToast({
          title: "请选择上下班时间",
          icon: "none",
        });
      }
    },

    // 处理打卡
    onCheckin() {
      uni.scanCode({
        onlyFromCamera: true,
        success(res) {
          // console.log("条码类型：" + res.scanType);
          // console.log("条码内容：" + res.result);

          console.log(res.result);

          checkinApi({sign: res.result})
            .then(res => {
              console.log(res);
              CustomToast({
                title: "打卡成功",
              });
            })
            .finally(() => {
            });

        },
      });
    },

    // 跳转到员工管理
    onJumpStaff() {
      uni.navigateTo({
        url: PageEnums.produceStaff + "?isNotMenu=true",
      });
    },

    // 跳转二维码
    onJumpCheckIn() {
      uni.navigateTo({
        url: PageEnums.attendCheckIn,
      });
    },
  },
  onUnload() {
    clearTimeout(this.timeVM);
  },
  computed: {
    // 判断打卡状态
    getCheckInStatus() {
      // 当前时间
      const T = dayjs();
      const today = this.MyToday || {};

      // 迟到未打卡
      if (!today.amSignInSuccess && T.isAfter(dayjs(`${T.format("YYYY-MM-DD")} ${this.form.morningCheckInTime || "00:00:00"}`, "m"))) {
        return "be_late_no_check";
      }

      return "";
    },

    // 标记是否打卡
    getSelected() {
      return [
        /* {
          date: "2025-01-16",
          info: "已打卡",
          // badgeBgc: '#4177f6'
        }, */
      ];
    },

    // 打卡描述
    getDescText() {
      const today = this.MyToday || {};
      if (!today.amSignInSuccess) {
        return `请在${this.form.morningCheckInTime}前打卡`;
      } else {
        return `请在${this.form.afternoonCheckOutTime}后打卡`;
      }
    },
  },
};
</script>

<template>
  <view class="ko-attend">
    <view class="ko-attend__set" v-if="isPerm('Product_Write')">
      <button class="ko-basic-button__card" @click="onJumpStaff">员工管理</button>
      <button class="ko-basic-button__card" @click="onJumpRecord">记录</button>
      <button class="ko-basic-button__card" @click="onSetCheckIn">设置</button>
      <button class="ko-basic-button__card" @click="onJumpCheckIn">二维码</button>
    </view>

    <view class="ko-attend__check-in">
      <view class="ko-attend__check" :class="[getCheckInStatus]" @click="onCheckin">
        <view class="ko-attend__check--title">上班打卡</view>
        <view class="ko-attend__check--time">
          {{ date.h }}
          <text class="ko-attend__check--time__parting">:</text>
          {{ date.m }}
        </view>
        <view class="ko-attend__check--desc">{{ getDescText }}</view>
      </view>

      <button class="ko-basic-button__card" @click="onCheckin">上班打卡</button>
    </view>

    <view class="ko-attend__calendar">
      <UniCalendar
        :insert="true"
        :lunar="true"
        @monthSwitch="onMonthSwitch"
        :selected="getSelected"
      />
    </view>

    <view class="ko-attend__footer">
      <view class="ko-attend__in">
        <view class="ko-attend__in--item">
          <view class="ko-attend__in--item--time">09:00</view>
          <view class="ko-attend__in--item--info">
            <view>上班</view>
            <view style="font-size: 12px;color: #c7c9ce;">08:34</view>
          </view>
        </view>
        <view class="ko-attend__in--item">
          <view class="ko-attend__in--item--time">09:00</view>
          <view class="ko-attend__in--item--info" style="border-bottom: none;">
            <view>下班</view>
            <view style="font-size: 12px;color: #c7c9ce;">16:34</view>
          </view>
        </view>
      </view>
    </view>

    <BasicPopup
      :visible.sync="visible"
      title="修改打卡规则"
    >
      <view class="ko-attend__popup">
        <uni-forms :model="form" label-width="80" label-align="right">
          <uni-forms-item label="上班时间：" name="morningCheckInTime">
            <PickerDate mode="time" v-model="form.morningCheckInTime" />
          </uni-forms-item>
          <uni-forms-item label="下班时间：" name="afternoonCheckOutTime">
            <PickerDate mode="time" v-model="form.afternoonCheckOutTime" />
          </uni-forms-item>
        </uni-forms>
      </view>
      <template #footer>
        <view style="display: flex; align-items: center; justify-content: center; padding-bottom: 20px;">
          <button
            @click="onSubmit"
            style="width: 130px;"
            class="ko-basic-button__card"
            :loading="sLoading"
            :disabled="sLoading"
          >
            保存
          </button>
        </view>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
@keyframes ShowHide {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.ko-attend {
  position: relative;

  &__check-in {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 70px 10px 30px;

    .ko-basic-button__card {
      margin-top: 20px;
    }
  }

  &__set {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 99;
    display: flex;
    justify-content: center;
    border-radius: 20px;
    overflow: hidden;

    .ko-basic-button__card {
      margin: 0;
      border-radius: 0;
      position: relative;

      &:before {
        content: " ";
        height: 30%;
        width: 1px;
        background: #fff;

        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }

      &:last-child {
        &:before {
          content: " ";
          display: none;
        }
      }
    }
  }

  &__check {
    height: 140px;
    width: 140px;
    border: 6px solid #4177f6;
    border-radius: 50%;

    // 迟到没有打卡
    &.be_late_no_check {
      border-color: #f3a73f;
    }

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &--desc {
      font-size: 10px;
      color: #c7c9ce;
      margin-top: 5rpx;
    }

    &--time {
      margin-top: 10px;
      font-weight: bold;

      &__parting {
        animation: ShowHide 1s linear infinite;
      }
    }
  }

  &__calendar {
    padding: 0 10px;
    border-top: 1px solid #e9e9eb;
  }

  &__footer {
    padding: 20px 10px 50px;
  }

  &__in {

    &--item {
      display: flex;
      align-items: center;

      &--time {
        font-size: 18px;
        width: 110px;
        text-align: center;
      }

      &--info {
        flex: 1;
        border-bottom: 1px solid #e9e9eb;
        padding: 20px 0;
      }
    }
  }

  // #ifdef H5
  .ko-basic-button {
    margin: 0 auto !important;
  }

  &__popup {
    width: 100%;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }

  // #endif

  // #ifdef MP
  &__popup {
    width: 90vw;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }

  // #endif
}
</style>
