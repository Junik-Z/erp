export default {
  isA4: Boolean,
  columns: {
    type: Array,
    default() {
      return [];
    },
  },
  data: {
    type: Array,
    default() {
      return [];
    },
  },
  node: {
    type: Object,
    default() {
      return {};
    },
  },
  feesList: {
    type: Array,
    default() {
      return [];
    },
  },
  header: String,
  option: {
    type: Object,
    default() {
      return {};
    },
  },
  rootStyle: {
    type: Object,
    default() {
      return {};
    },
  },
};
