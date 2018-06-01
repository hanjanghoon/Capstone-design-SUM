
float cal(float pm10,float pm25,float th,float co2)
{
	float arr[4]={pm10,pm25,th,co2}; // 비교할 인자들. 
	float bpl[4][4]=		//각인자에 맞는 low값(좋음 보통 나쁨 아주나쁨)의 low 부분/
	{
		{0,31,81,151},
		{0,16,36,76},
		{0,68,75,80},
		{0,451,1001,2001}
	};
	float bph[4][4]=		// 각인자에 맞는 high값 (좋음 보통 나쁨 아주나쁨 high 부분;
	{
		{ 30,80,150,600 },
		{ 15,35,75,500 },
		{ 67,74,79,100 },
		{ 450,1000,2000,5000 }
	};
	int i, j;
	float il[4]={ 0,51,101,251 }; //대기지표 점수 좋음 보통 나쁨 아주나쁨의 low 부분
	float ih[4]={ 50,100,250,500 };//대기지표 점수 좋음 보통 나쁨 아주나쁨의 high 부분
	float tmp=0;
	float high=0;
	int flag=0;
	for(i=0; i<4; i++)
	{
		for(j=0; j<4; j++)
		{
			if(arr[i]>=bpl[i][j]&&arr[i]<=bph)
				tmp=(ih[j]-il[j])/(bph[i][j]-bpl[i][j])*(arr[i]-bpl[i][j]))+il[j];
			if(high<tmp)
				high=tmp;
			if(j>1)
				flag++;
		}
	}
	if(flag==2)
		high+=50;
	else if(flag>2)
		high+=75;
	return high;
}
int main(void)
{
	float indoorip;
	float outdoorip;
	float th;
	int timer;
	th=9/5*intemp-0.55*(1-inhum)*(9/5*intemp-26)+32;
	indoorip=cal(pm10, pm25, th, co2);
	
	th=9/5*outtemp-0.55*(1-outhum)*(9/5*outtemp-26)+32;
	outdoorip=cal(pm10, pm25, th, co2);
	
	if(timer>=0&&time<10)
	{
		if(indoorip<100&&outdoorip<100)
			if(abs(indoorip-outdoorip)<30)
				flag=0;
			else
				flag=1;
		else
		{
			if(indoorip>outdoorip)
				flag=0;//환기
			else
				flag=1;
		}
	}
	timer++;
	if(timer==30)
		timer=0;
}