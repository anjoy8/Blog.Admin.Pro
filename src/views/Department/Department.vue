<template>
  <section>
    <!--工具条-->
    <!-- <toolbar :buttonList="buttonList" @callFunction="callFunction"></toolbar> -->

    <!--列表-->
    <a-table :data-source="departments" :columns="columns" :rowKey="'Id'" :loading="listLoading"
      :expanded-row-keys.sync="expandedRowKeys"  :row-selection="rowSelection" style="width: 100%" ref="table">
      <span slot="Status" slot-scope="Status">
        <a-tag :color="Status ? 'green' : 'red'" disable-transitions>{{ !Status ? "否" : "是"
        }}</a-tag>
      </span>
    </a-table>


  </section>
</template>

<script>
import util from "@/utils/date";
import {
  getDepartmentTreeTable,
  removeDepartment,
  editDepartment,
  addDepartment,
  getDepartmentTree,
  getDepartmentListPage,
} from "@/api/api";
import { getButtonList } from "@/permission";
import Toolbar from "../../components/Toolbar";

const columns = [
  {
    title: '部门',
    dataIndex: 'Name',
    key: 'Name',
  },
  {
    title: 'Id',
    dataIndex: 'Id',
    key: 'Id',
  },
  {
    title: '上级关系',
    dataIndex: 'CodeRelationship',
    key: 'CodeRelationship',
  },
  {
    title: '负责人',
    dataIndex: 'Leader',
    key: 'Leader',
  },
  {
    title: '排序',
    dataIndex: 'OrderSort',
    key: 'OrderSort',
  },
  {
    title: '是否有效',
    key: 'Status',
    dataIndex: 'Status',
    scopedSlots: { customRender: 'Status' },
  },
  {
    title: '创建时间',
    dataIndex: 'CreateTime',
    key: 'CreateTime',
  },
  {
    title: '更新时间',
    dataIndex: 'ModifyTime',
    key: 'ModifyTime',
  },
];

const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  onSelect: (record, selected, selectedRows) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    console.log(selected, selectedRows, changeRows);
  },
};

export default {
  components: { Toolbar },
  data() {
    return {
      columns,
      rowSelection,
      expandedRowKeys: [],
      selectedRowKeys: [],
      buttonList: [],
      currentRow: null,
      options: [],
      filters: {
        Name: "",
      },
      departments: [],
      modules: [], //接口api列表
      statusList: [
        { Name: "激活", value: true },
        { Name: "禁用", value: false },
      ],
      total: 0,
      page: 1,
      listLoading: false,
      sels: [], //列表选中列

      addDialogFormVisible: false,
      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
      editFormRules: {
        Name: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
        PidArr: [{ required: true, message: "请选择父节点", trigger: "blur" }],
      },
      //编辑界面数据
      editForm: {
        Id: 0,
        OrderSort: 0,
        PidArr: [],
        CreateBy: "",
        Name: "",
        CodeRelationship: "",
        Leader: "",
        Enabled: true,
        Status: false,
      },

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        Name: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
        PidArr: [{ required: true, message: "请选择父节点", trigger: "blur" }],
      },
      //新增界面数据
      addForm: {
        CreateBy: "",
        CreateId: "",
        PidArr: [],
        OrderSort: 0,
        Name: "",
        CodeRelationship: "",
        Leader: "",
        Enabled: true,
        Status: true,
      },
      isResouceShow: 0,
    };
  },
  methods: {
    dialogCheck(selection, row) {
      this.currentRow = null;
      // this.$refs.table.clearSelection();
      if (selection.length === 0) {
        return;
      }
      if (row) {
        this.selectCurrentRow(row);
      }
    },
    selectCurrentRow(val) {
      if (val) {
        this.currentRow = val;
        // this.$refs.table.clearSelection();
        this.$refs.table.toggleRowSelection(val, true);
      }
    },
    callFunction(item) {
      this.filters = {
        name: item.search,
      };
      this[item.Func].apply(this, item);
    },
    formatCreateTime: function (row, column) {
      return !row.CreateTime || row.CreateTime == ""
        ? ""
        : util.formatDate.format(
          new Date(row.CreateTime),
          "yyyy-MM-dd hh:mm:ss"
        );
    },
    formatModifyTime: function (row, column) {
      return !row.ModifyTime || row.ModifyTime == ""
        ? ""
        : util.formatDate.format(
          new Date(row.ModifyTime),
          "yyyy-MM-dd hh:mm:ss"
        );
    },
    handleCurrentChange(val) {
      this.page = val;
      this.handleQuery();
    },
    load(tree, treeNode, resolve) {
      let para = {
        page: this.page,
        f: tree.Id,
        key: this.filters.Name,
      };
      getDepartmentTreeTable(para).then((res) => {
        resolve(res.data.response);
      });
    },
    //获取用户列表
    handleQuery() {
      let para = {
        page: this.page,
        key: this.filters.name,
      };
      this.listLoading = true;

      //NProgress.start();
      getDepartmentListPage(para).then((res) => {
        this.departments = res.data.response.data;
        this.listLoading = false;
        //NProgress.done();
      });
    },
    //删除
    handleDel() {
      let row = this.currentRow;
      if (!row) {
        this.$message({
          message: "请选择要删除的一行数据！",
          type: "error",
        });

        return;
      }
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning",
      })
        .then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = { id: row.Id };
          removeDepartment(para).then((res) => {
            if (util.isEmt.format(res)) {
              this.listLoading = false;
              return;
            }
            this.listLoading = false;
            //NProgress.done();
            if (res.data.success) {
              this.$message({
                message: "删除成功",
                type: "success",
              });
            } else {
              this.$message({
                message: res.data.msg,
                type: "error",
              });
            }

            this.handleQuery();
          });
        })
        .catch(() => { });
    },
    //显示编辑界面
    handleEdit() {
      let row = this.currentRow;
      if (!row) {
        this.$message({
          message: "请选择要编辑的一行数据！",
          type: "error",
        });

        return;
      }
      let that = this;

      that.options = [];

      this.editForm = {};
      that.editLoading = true;
      that.editFormVisible = true;
      let para = { pid: row.Id };
      getDepartmentTree(para).then((res) => {
        ++that.isResouceShow;
        this.options.push(res.data.response);
        that.editForm = Object.assign({}, row);
        that.editLoading = false;
      });
    },
    //显示新增界面
    handleAdd() {
      this.options = [];
      this.addFormVisible = true;
      this.addLoading = true;
      this.addForm = {
        CreateBy: "",
        CreateId: "",
        PidArr: [],
        Name: "",
        CodeRelationship: "",
        OrderSort: 0,
        Leader: "",
        Enabled: true,
        Status: false,
      };

      let para = { pid: 0 };
      getDepartmentTree(para).then((res) => {
        ++this.isResouceShow;
        this.options.push(res.data.response);
        this.addLoading = false;
      });
    },
    //编辑
    editSubmit() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);
            para.CodeRelationship = para.PidArr.join() + ",";

            para.ModifyTime = util.formatDate.format(
              new Date(),
              "yyyy-MM-dd hh:mm:ss"
            );

            para.Pid = para.PidArr.pop();

            if (para.Id == para.Pid) {
              this.$message({
                message: "警告，父节点不能是自己！",
                type: "error",
              });

              this.editLoading = false;
              return;
            }
            editDepartment(para).then((res) => {
              if (util.isEmt.format(res)) {
                this.editLoading = false;
                return;
              }
              this.editLoading = false;
              if (res.data.success) {
                this.editLoading = false;
                //NProgress.done();
                this.$message({
                  message: res.data.msg,
                  type: "success",
                });
                this.$refs["editForm"].resetFields();
                this.options = [];
                this.$refs.table.setCurrentRow();
                this.editFormVisible = false;
                this.handleQuery();
              } else {
                this.$message({
                  message: res.data.msg,
                  type: "error",
                });
              }
            });
          });
        }
      });
    },
    //新增
    addSubmit() {
      let _this = this;
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.addForm);
            para.CodeRelationship = para.PidArr.join() + ",";

            para.CreateTime = util.formatDate.format(
              new Date(),
              "yyyy-MM-dd hh:mm:ss"
            );
            para.ModifyTime = para.CreateTime;
            para.IsDeleted = false;

            para.Pid = para.PidArr.pop();

            var user = JSON.parse(window.localStorage.user);

            if (user && user.uID > 0) {
              para.CreateId = user.uID;
              para.CreateBy = user.uRealName;
            } else {
              this.$message({
                message: "用户信息为空，先登录",
                type: "error",
              });
              _this.$router.replace(
                _this.$route.query.redirect ? _this.$route.query.redirect : "/"
              );
            }

            addDepartment(para).then((res) => {
              if (util.isEmt.format(res)) {
                this.addLoading = false;
                return;
              }
              this.addLoading = false;
              if (res.data.success) {
                this.addLoading = false;
                //NProgress.done();
                this.$message({
                  message: res.data.msg,
                  type: "success",
                });
                this.$refs["addForm"].resetFields();
                this.options = [];
                this.$refs.table.setCurrentRow();
                this.addFormVisible = false;
                this.handleQuery();
              } else {
                this.$message({
                  message: res.data.msg,
                  type: "error",
                });
              }
            });
          });
        }
      });
    },
  },
  mounted() {
    this.handleQuery();

    let routers = window.localStorage.router && window.localStorage.router.length > 20
      ? JSON.parse(window.localStorage.router)
      : [];
    // this.buttonList = getButtonList(this.$route.path, routers);
  },
};
</script>
