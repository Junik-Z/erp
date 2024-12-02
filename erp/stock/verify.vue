<script>
import UniGroup from "@/uni_modules/uni-group/components/uni-group/uni-group.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniDataCheckbox from "@/uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.vue";

export default {
  name: "verify",
  components: {UniCol, UniRow, BasicCard, UniSection, UniGroup, UniDataCheckbox},
  data: () => ({
    local: [
      {
        text: "确认",
        value: 1,
      },
    ],
  }),
};
</script>

<template>
  <view class="ko-verify">
    <UniSection title="基础信息" type="line">
      <UniGroup>
        <view>名称：xxxx</view>
      </UniGroup>
    </UniSection>

    <UniSection title="入库产品明细" type="line">
      <UniGroup>
        <BasicCard>
          <UniRow class="ko-verify__item">
            <UniCol :span="12">编号： 1</UniCol>
            <UniCol :span="12">名称： 1</UniCol>
            <UniCol :span="12">规格： 1</UniCol>
            <UniCol :span="12">产品图片： 1</UniCol>
            <UniCol :span="12">数量： 1</UniCol>
          </UniRow>
        </BasicCard>
      </UniGroup>
    </UniSection>

    <UniSection title="入库确认" type="line">
      <UniGroup>
        <view style="display: flex;align-items: center;">
          入库确认：
          <UniDataCheckbox :localdata="local" />
        </view>
      </UniGroup>
    </UniSection>


    <view class="ko-verify__footer">
      <button class="ko-basic-button">驳回</button>
      <button class="ko-basic-button">通过</button>
    </view>

  </view>
</template>

<style scoped lang="scss">

.ko-verify {
  &__item {
    display: flex;
    flex-direction: row;

    view {
      width: calc(50% - 10px);
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-around;

    padding: 10px 50px 50px;

    .ko-basic-button {
      width: 40%;
    }
  }
}
</style>
