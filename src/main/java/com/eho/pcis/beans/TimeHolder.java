package com.eho.pcis.beans;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

public class TimeHolder {

	private int year;
	
	private int month;
	
	private int day;
	
	private int hour;
	
	private int minute;
	
	private int second;
	
	private long millisecond;
	
	private String stamp;
	
	
	public TimeHolder() {

    	Date date = new Date();
    	LocalDateTime localDate = date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    	year  = localDate.getYear();
    	month = localDate.getMonthValue();
    	day   = localDate.getDayOfMonth();
    	hour = localDate.getHour();
    	minute = localDate.getMinute();
    	second = localDate.getSecond();
    	millisecond = System.currentTimeMillis() % 1000;
    	stamp = String.format("%04d-%02d-%02d %02d:%02d:%02d - %03d", year, month, day, hour, minute, second, millisecond);
	}



	public int getYear() {
		return year;
	}



	public int getMonth() {
		return month;
	}



	public int getDay() {
		return day;
	}



	public int getHour() {
		return hour;
	}



	public int getMinute() {
		return minute;
	}



	public int getSecond() {
		return second;
	}



	public long getMillisecond() {
		return millisecond;
	}



	public String getStamp() {
		return stamp;
	}
}
