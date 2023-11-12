(function ($) {
    //total revenue chart
    var options = {
      series:[{
          name: 'Revenue 1',
          data:[2, 15, 25, 20, 30, 26, 24, 15, 12, 20]
        },         
        {
          name: 'Revenue 2',
          data:[10, 25, 15, 16, 10, 14, 28, 18, 20, 16]
        }
      ],
      chart:{
        height: 168,
        type:'area',
        opacity:1 ,
        toolbar: {
          show:false,
        },
      },
      grid: {
        yaxis: {
          lines: {
            show: false,
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      fill:{ 
        opacity: [0.5, 0.25, 1],        
      },
      stroke: {
        width:[3, 3],
        curve: 'smooth',
      },
      xaxis: {
        offsetX: 0,
        offsetY: 0,
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
        labels: {
            low: 0,
            offsetX: 0,
            show: false,
        },
        axisBorder: {
            low: 0,
            offsetX: 0,
            show: false,
        },
        axisTicks: {
            show: false,
        },
      },
      legend:{
        show: false
      },
      yaxis: {
        show: false,
      },
      tooltip: {
        x: {
            format: 'MM'
        },
      },
      colors:[TivoAdminConfig.secondary,TivoAdminConfig.primary],
      };
    var chart = new ApexCharts(document.querySelector("#revenue-chart"), options);
    chart.render();
    // user chart
    var options1 = {
      series: [99, 24, 20, 28],
      chart: {
        type: 'donut',
        height: 300,
      },
      dataLabels:{
        enabled: false
      },
      legend:{
        show: false
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
        },
        breakpoint: 360,
        options: {
          chart: {
            height: 280
          },
        }
      }],
      plotOptions: {
        pie: {
          donut: {
            size: '70%'
          }
        }
      }, 
      yaxis: {
        labels: {
            formatter: function(val) {
                return val / 100 + "$";
            },
        },          
      },
      colors:[ TivoAdminConfig.primary, TivoAdminConfig.secondary, TivoAdminConfig.secondary, TivoAdminConfig.secondary],
    };
    var chart1 = new ApexCharts(document.querySelector("#user-chart"), options1);
    chart1.render();
    //earning chart
   
    $.ajax({
      url: `/admin/allpackages`,
      type:'POST',
      contentType:'application/json',
      success: (response)=> {
        let n ='<form id="editdata">',m='<form id="editdata1">';
        response.packages.forEach((package) => {
          if(!package.status) {
              n +=`
                <div class="d-flex align-items-start  mb-3">
                  <div class="activity-dot-secondary"></div>
                  <div class="flex-grow-1">
                    <p class="mb-0">${package.sender}</p>
                    <p class="mb-0">${package.receiver}</p>
                    <p class="mb-0" style="font-weight:bold;">${package.tracking_id}</p>
                  </div>
                    <input type="checkbox" data-target="${package.tracking_id}">
                </div>
            `;
          }else{
            m +=`<div class="d-flex align-items-start mb-3">
                  <div class="activity-dot-secondary"></div>
                  <div class="flex-grow-1">
                    <p class="mb-0">${package.sender}</p>
                    <p class="mb-0">${package.receiver}</p>
                    <p class="mb-0" style="font-weight:bold;">${package.tracking_id}</p>
                  </div>
                  <input type="checkbox" data-target="${package.tracking_id}">
                </div>
            `;
          }
        });
        n +=`
          <div class="d-flex align-items-center">
            <button class="btn btn-primary" type="submit" id="upS" data-target="upS">
              <i class="fa fa-refresh"></i> Update status
            </button>
          </div>
        </form>`;
        m +=`
        <div class="d-flex align-items-center">
          <button class="btn btn-danger" type="submit" id="del" data-target="del">
            <i class="fa fa-trash"></i> Delete
          </button>
        </div>
      </form>`;

        $('#packageTimeline').html(n);
        $('#packageTimelin').html(m);

        $('#editdata').on('submit', (e)=> {
          e.preventDefault();
          let df = [];
          for(let i=0;i<e.target.length-1;i++) {
            df.push({checked:e.target[i].checked, id:e.target[i].dataset.target})
          }
          let selected = [];
          df.forEach(elem => {
            if(elem.checked) {
              selected.push(elem.id)
            }
          })
          $.ajax({
            url: `/admin/update_status`,
            type:'POST',
            contentType:'application/json',
            data:JSON.stringify({
              data: selected
            }),
            success: (response)=> {
              console.log(response)
                if(response.success){
                  window.location = '/admin/home#packageTimeline';
                  window.location.reload();
                }else{
                  alert(response.message)
                }
            }
          });
            
        })

        $('#editdata1').on('submit', (e)=> {
          e.preventDefault();
          let df = [];
          for(let i=0;i<e.target.length-1;i++) {
            df.push({checked:e.target[i].checked, id:e.target[i].dataset.target})
          }

          let selected = [];
          df.forEach(elem => {
            if(elem.checked) {
              selected.push(elem.id)
            }
          })
          $.ajax({
            url: `/admin/delete_package`,
            type:'POST',
            contentType:'application/json',
            data:JSON.stringify({
              data: selected
            }),
            success: (response)=> {
              console.log(response)
              if(response.success){
                window.location = '/admin/home#packageTimelin';
                window.location.reload();
              }else{
                  alert(response.message)
              }
            }
          });
          
        })

        var completePercent = Math.floor((response.completed.length/response.packages.length) * 100);
        $('#cmp').html(completePercent+'%');
        $('#awt').html(100-completePercent+'%');
        var options = {
          series: [ {
            name: 'Packages',
            data: [response.packages.length, (response.packages.length - response.completed.length), response.completed.length],
          },
        ],
        chart: {
          type: 'bar',
          toolbar: {
            show: false
          },
          height: 270,
          stacked: true,
        },
          states: {          
          hover: {
            filter: {
              type: 'darken',
              value: 1,
            }
          }           
        },
        plotOptions: {
          bar: {
            horizontal: false,
            s̶t̶a̶r̶t̶i̶n̶g̶S̶h̶a̶p̶e̶: 'flat',
            e̶n̶d̶i̶n̶g̶S̶h̶a̶p̶e̶: 'flat',
            borderRadius: 6,
            columnWidth: '19%',            
          }
        },
        responsive: [{
          breakpoint: 1199.98,
          options: {
            chart: {
              height: 320
            },
          }
        }],   
        dataLabels: {
          enabled: false
        },
        grid: {
          yaxis: {
            lines: {
                show: false
            }
          },
        },
        xaxis: {
          categories: ['All', 'Awaiting', 'Completed'],
          offsetX: 0,
          offsetY: 0,
          axisBorder: {
              low: 0,
              offsetX: 0,
              show: false,
          },
          axisTicks: {
              show: false,
          },
        },
        yaxis: {
          show: false,
          dataLabels: {
            enabled: true
          },
        },
        fill: {
          opacity: 1,
          colors: [TivoAdminConfig.primary, '#eeeffe']
        },
        legend: {
          show: false
        },
        };
        var chart = new ApexCharts(document.querySelector("#earning-chart"), options);
        chart.render();
      }
    });
    
    
    //growth chart
    var options = {
        series: [{
          type: 'line',
          name: 'Monthly',
          data: [0, 19, 14],
          color:TivoAdminConfig.primary,
        }],
        chart:{
        height:280,
        type:'line',        
        toolbar:{
          show: false
        },
      },
      stroke: {
        width: [0, 0, 5],
        curve: 'smooth'
      },
      annotations: {
        xaxis: [{
            x: 300,
            strokeDashArray: 0,
            borderWidth: 3,
            borderColor: TivoAdminConfig.primary,
          },
        ],
        points: [{
            x: 300,
            y: 48,
            marker: {
                size: 8,
                fillColor: TivoAdminConfig.primary,
                strokeColor: TivoAdminConfig.primary,
                radius: 5,
            },
            label: {
              borderWidth: 0,
              offsetY: 0,
              text: 'We are Achieve Our Goal in Progress',
              style: {
                fontSize: '14px',
                fontWeight: '600',
                fontFamily:'Montserrat',
              }
          }
        }],
      },
      responsive: [{
        breakpoint: 767,
        options: {
          chart: {
            height: 250
          },
        },
        breakpoint: 575,
        options: {
          chart: {
            height: 220
          },
          annotations: {
            xaxis: [{
                x: 100,
                strokeDashArray: 0,
                borderWidth: 3,
                borderColor: TivoAdminConfig.primary,
              },
            ],
            points: [{
                x: 100,
                y: 48,
                marker: {
                    size: 8,
                    fillColor: TivoAdminConfig.primary,
                    strokeColor: TivoAdminConfig.primary,
                    radius: 5,
                },
                label: {
                  borderWidth: 0,
                  offsetX: 25,
                  text: 'We are Achieve Our Goal in Progress',
                  style: {
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily:'Montserrat',
                  }
              }
            }],
          },
        }
      }],
      fill: {
        type: ['solid' , 'gradient' , 'gradient'],
        gradient: {
          shade: 'dark',
          type: "horizontal",
          shadeIntensity: 1,
          gradientToColors: [TivoAdminConfig.secondary , TivoAdminConfig.primary ],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 0.2,
          stops: [0, 100, 100, 100],
        }
      },      
      grid: {
        yaxis: {
          lines: {
            show: false,
          }
        }
      },
      xaxis: {
        offsetX: 0,
        offsetY: 0,
        categories: ["11-09-2022", "12-09-2022", "13-09-2022", "14-09-2022", "15-09-2022", "16-09-2022", "17-09-2022", "18-09-2022", "19-09-2022", "20-09-2022", "21-09-2022", "22-09-2022", "23-09-2022", "24-09-2022"],
        axisBorder: {
            low: 0,
            offsetX: 0,
            show: false,
        },
        axisTicks: {
            show: false,
        },
        labels: {
          low: 0,
          offsetX: 0,
          show: false,
        }
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy'
        },
      },
      yaxis: {
        show: false,
        lines: {
          show: false
        },
        dataLabels: {
          enabled: true
        },
      },
      legend: {
        show: false
      }
    };
    // vector map
    ! function(maps) {
      "use strict";
      var b = function() {};
      b.prototype.init = function(markerss) {
          maps("#asia").vectorMap({
              map: "world_mill_en",
              backgroundColor: "transparent",
              regionStyle: {
                  initial: {
                      fill: TivoAdminConfig.primary
                  } 
              },
              zoomButtons : false,
              markers: markerss,
              series: {
                regions: [{
                  scale: ['#fdd5df', '#fd0846'],
                  normalizeFunction: 'polynomial',
                }]
              }
          })
      }, maps.VectorMap = new b, maps.VectorMap.Constructor = b
    }(window.jQuery),
      function(maps) {
          "use strict";
          $.ajax({
            url: `/admin/allbranch`,
            type:'POST',
            contentType:'application/json',
            success: (response)=> {
              let markrs = [];
              response.allbranch.forEach(branch=> {
                markrs.push({ latLng: [branch.latitude, branch.longitude], name: branch.branch, style: {r: 4, fill:'#61ae41'}})
              });
              let bb = '',branches='';
              response.allbranch.forEach(branch=> {
                branches +=` <option value="${branch.branch_id}">${branch.branch}</option>`;
                bb +=`<li>
                  <p class="font-primary f-12">${branch.location} </p><span class="f-w-600"></span>
                </li>`
              });
              $('#porigin').html(branches);
              $('#pdest').html(branches);

              $('#foot').html(bb);
              maps.VectorMap.init(markrs)
            }
        });
          
    }(window.jQuery);
})(jQuery);
 // time 
 function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  m = checkTime(m);
  // document.getElementById('txt').innerHTML = h + ":" + m  + ' ' + ampm;
  // var t = setTimeout(startTime, 500);
}
function checkTime(i) {
  if (i < 10) {i = "0" + i};
  return i;
}

$('#newpackage').on('submit', (e)=> {
  e.preventDefault();
    $.ajax({
      url: `/admin/newpackage`,
      type:'POST',
      contentType:'application/json',
      data:JSON.stringify({
          "sender": $('#sname').val(),
          "receiver": $('#rname').val(),
          "sender_phone": $('#sphone').val(),
          "receiver_phone": $('#rphone').val(),
          "driver_id": $('#driverid').val(),
          "origin": $('#porigin').val(),
          "destination": $('#pdest').val(),
          "details": $('#details').val(),
      }),
      success: (response)=> {
          if(response.success){
              console.log(response)
              window.location = '/admin/home#newpackage';
              window.location.reload();
          }else{
              alert(response.message)
          }
      }
  });
})


$(function(){
  $.ajax({
      url: `/admin/alldrivers`,
      type:'POST',
      contentType:'application/json',
      success: (response)=> {
        var arr = response.response;
        let drivers = {};
        $('#intr').html(`${(arr.filter(elem => elem.status == 0).length)} Delivery processing `);
        $('#delv').html(`${(arr.filter(elem => elem.status == 1).length)} Delivery completed `);

        for(let dd of arr) {
          if(drivers[dd.consignee_id]) {
            drivers[dd.consignee_id]['count'] +=1;
          }else{
            drivers[dd.consignee_id] = dd;
            drivers[dd.consignee_id]['count'] = 1;
          }
        }
        let shtml ='',pdriverid='';
        for(let s of Object.keys(drivers)) {
          pdriverid +=` <option value="${drivers[s].consignee_id}">${drivers[s].name}</option>`;
          shtml += `
            <tr>
                <td>
                  <div class="d-flex"><img class="img-fluid align-top circle" src="/assets/images/dashboard/default/01.png" alt="">
                    <div class="flex-grow-1"><a href="#"><span>${drivers[s].name}</span></a>
                      <p class="mb-0">${drivers[s].count} Package(s)</p>
                    </div>
                    <div class="active-status active-online"></div>
                  </div>
                </td>
            </tr>
          `;
        }
        $('#driverid').html(pdriverid);
        $("#driverss").html(shtml);

      }
  });
});