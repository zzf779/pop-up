import { Component, OnInit } from '@angular/core';
import { ModuleService } from '../../api/module.service';
import * as G2 from '@antv/g2';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ArticlesDto } from 'src/app/api/dto';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
// @Component({
//   selector: 'nz-demo-input-search-input',
//   template: './search.component.html',
//   styleUrls: ['./search.component.css']
// })
export class HomeComponent implements OnInit {

  tableLoading = false; // table开关加载
  checked = false; // checkbox 是否被选中
  indeterminate = false; // checkbox indeterminate 状态
  articleOne: any = {};
  listOfData: ArticlesDto[] = []; // 表格数据
  setOfCheckedId = new Set<string>(); // 所选数据序号的集合
  visible = false;
  chartNumber = 0; // 记录抽屉打开次数
  skeletonLoading = false; // 骨架屏加载
  modalLoading = false; // favorite模态框确定加载
  selectedLoading = false;// 下拉加载

  sourceList = []; // source筛选列表
  sourceValue = ''; // 根据source值搜索
  titleValue = '';// 根据title值搜索
  _postTitleValue = '';

  pageSize = 10; // 一页有多少数据
  pageIndex = 0; // 当前页数
  total = 0; // 数据总数

  data = [
    { genre: '700', sold: 275 },
    { genre: '1600', sold: 115 },
    { genre: '1800', sold: 120 },
    { genre: '300', sold: 350 }
  ];
  data1 = [
    { time: '1st', val: 42.035, title: '线路1' },
    { time: '2st', val: 34.241, title: '线路1' },
    { time: '2nd', val: 32.035, title: '线路1' },
    { time: '3nd', val: 22.692, title: '线路1' },
    { time: '3rd', val: 36.032, title: '线路1' },
    { time: '4rd', val: 42.431, title: '线路1' },
    { time: '4th', val: 42.03, title: '线路1' },
    { time: '5th', val: 40.026, title: '线路1' },
    { time: '6th', val: 19.522, title: '线路1' }
  ];

  constructor(
    private message: NzMessageService,
    private ModuleService: ModuleService,
    private modal: NzModalService) { }

  /**
   * 是否收藏
   *
   * @param {string} _id
   * @param {boolean} isFav
   * @memberof HomeComponent
   */
  clickSwitch(_id: string, isFav: boolean): void {
    this.modal.confirm({
      nzTitle: isFav ? 'Do you set this article as your favorite?' : 'Do you want to cancel this article as your favorite?',
      nzOnOk: () => {
        this.modalLoading = true;
        this.ModuleService.Favorite({ isFavorite: isFav, articleId: _id }).subscribe(e => {
          this.modalLoading = false;
          if (e.isSuccess) {
            this.message.success(e.msg);
            this.listOfData.filter(i => i._id == _id)[0].favorite = !isFav;
          } else {
            this.message.error(e.msg);
          }
        })
      },
    });
  }

  drawerOpen(): void {
    this.visible = true;
    if (this.chartNumber === 0) {
      this.lineChartData('lineChart1');
      this.barChartData('barChart1');
      this.lineChartData('lineChart2');
      this.barChartData('barChart2');
    }
    this.chartNumber++;
  }

  drawerClose(): void {
    this.visible = false;
  }

  /**
   * 复选框状态更新后将序号放入setOfCheckedId中
   *
   * @param {number} _id
   * @param {boolean} checked
   * @memberof HomeComponent
   */
  updateCheckedSet(_id: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(_id);
    } else {
      this.setOfCheckedId.delete(_id);
    }
  }

  /**
   * 选中的回调
   *
   * @param {number} _id
   * @param {boolean} checked
   * @memberof HomeComponent
   */
  onItemChecked(_id: string, checked: boolean): void {
    this.updateCheckedSet(_id, checked);
    this.refreshCheckedStatus();
  }

  /**
   * 全选、取消选择
   *
   * @param {boolean} value
   * @memberof HomeComponent
   */
  onAllChecked(value: boolean): void {
    this.listOfData.forEach(item => this.updateCheckedSet(item._id, value));
    this.refreshCheckedStatus();
  }

  /**
   * 更改某个复选框的状态
   *
   * @memberof HomeComponent
   */
  refreshCheckedStatus(): void {
    this.checked = this.listOfData.every(item => this.setOfCheckedId.has(item._id));
    this.indeterminate = this.listOfData.some(item => this.setOfCheckedId.has(item._id)) && !this.checked;
  }

  lineChartData(id) {
    // 创建 Chart 对象
    const chart = new G2.Chart({
      container: id, // 指定图表容器 ID
      autoFit: true,
      height: 300 // 指定图表高度
    });
    chart.legend({
      position: 'right',
      offsetX: 0,
    }); // 只更改 x 维度对应的图例的显示位置
    // 载入数据源
    chart.data(this.data1);
    chart.scale({
      time: {
        range: [0, 1],
      },
      val: {
        nice: true,
      },
    });

    chart.tooltip({
      showCrosshairs: true, // 展示 Tooltip 辅助线
      shared: true,
    });
    // chart.line().position('time*val').color(title).shape('smooth');
    chart.point().position('time*val');
    //  渲染图表
    chart.render();
  }

  barChartData(id) {
    const chart = new G2.Chart({
      container: id, // 指定图表容器 ID
      autoFit: true,
      height: 300 // 指定图表高度
    });
    chart.data(this.data);
    chart.scale({
      time: {
        range: [0, 1],
      },
      val: {
        nice: true,
      },
    });
    chart.tooltip({
      showCrosshairs: true, // 展示 Tooltip 辅助线
      shared: true,
    });
    chart.interval().position('genre*sold').color('genre');
    //  渲染图表
    chart.render();
  }



  /**
   * 获取数据库第一条数据
   *
   * @memberof HomeComponent
   */
  getArticleOne() {
    this.skeletonLoading = true;
    this.ModuleService.ArticleOne().subscribe(e => {
      this.skeletonLoading = false;
      if (e.isSuccess) {
        this.articleOne = e.data;
      } else {
        this.message.error(e.msg);
      }
    })
  }

  /**
   * 获取source列表
   *
   * @memberof HomeComponent
   */
  getSource() {
    this.selectedLoading = true;
    this.ModuleService.Sources().subscribe(e => {
      this.selectedLoading = false;
      if (e.isSuccess) {
        this.sourceList = e.data;
      }
    })
  }
  /**
   * 根据source筛选 选中的 nz-option 发生变化时，调用此函数 
   *
   * @param {string} _id
   * @memberof HomeComponent
   */
  searchSource() {
    this.pageIndex = 0;
    this.getArticles();
  }


  _titleStr = '';
  get titleStr() {
    return this._titleStr;
  }

  set titleStr(v) {
    this._titleStr = v.trim();
    if (this._titleStr === '' && this._postTitleValue !== '') {
      this._postTitleValue = this._titleStr;
      this.searchTitle();
    }
  }

  /**
   * 根据title搜索
   *
   * @memberof HomeComponent
   */
  searchTitle() {
    if (this.titleValue !== '') {
      this._postTitleValue = this.titleValue;
    } else {
      this._postTitleValue = '';
    }

    this.pageIndex = 0;
    this.getArticles();
  }
  /**
    * 分页获取数据（表格）
    *
    * @param {number} [pI=this.pageIndex]
    * @memberof HomeComponent
    */
  getArticles(pI: number = this.pageIndex) {
    this.tableLoading = true;
    this.pageIndex = pI;
    this.getSource();
    this.ModuleService.ArticlesTable(this.pageSize, pI, this._postTitleValue, this.sourceValue).subscribe(e => {
      this.tableLoading = false;
      if (e.isSuccess) {
        e.data.articlesList.forEach(source => {
          const newListOfData = this.sourceList.find(m => m._id == source.source);
          source.source=newListOfData.title;
        });
        this.listOfData = e.data.articlesList;
        this.total = e.data.total;
      } else {
        this.message.error(e.msg);
      }
    })
  }
  ngOnInit(): void {
    this.getArticles();
    this.getArticleOne();
    // this.getSource();
  }
}
// export class NzDemoInputSearchInputComponent implements NzIconModule{}
