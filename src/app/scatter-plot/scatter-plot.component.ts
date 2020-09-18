import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ZoomableScatter } from '../charts/zoomable-scatter';
import * as d3 from 'd3';

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.scss']
})
export class ScatterPlotComponent implements OnInit, AfterViewInit {
  @ViewChild('svgElement') svgElement: ElementRef<SVGSVGElement>;
  height = 480;
  width = 720;
  data: [number, number, number][];
  chart: ZoomableScatter;
  constructor() { }

  generateData(): [number, number, number][] {
    const random = d3.randomNormal(0, 0.2);
    const sqrt3 = Math.sqrt(3);
    return [].concat(
      Array.from({ length: 300 }, () => [random() + sqrt3, random() + 1, 0]),
      Array.from({ length: 300 }, () => [random() - sqrt3, random() + 1, 1]),
      Array.from({ length: 300 }, () => [random(), random() - 1, 2])
    );
  }

  ngOnInit(): void {
    this.data = this.generateData();
  }
  ngAfterViewInit(): void {
    this.chart = new ZoomableScatter(this.data, this.svgElement.nativeElement);
    const chartSvg = this.chart.chart(this.width, this.height);
  }
  resetClicked(): void {
    this.chart.resetZoom();
  }
}
