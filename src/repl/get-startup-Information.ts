import fs from "fs";
import { getActiveUser } from "../util/get-logged-in-user.ts";
import { red } from "yoctocolors";

export const getInitialText = () => {
  return String.raw`
____/\\\\\\\\\________/\\\\\\\\\______/\\\\\\\\\\\__/\\\________/\\\_        
  __/\\\///////\\\____/\\\///////\\\___\/////\\\///__\/\\\_______\/\\\_       
  _\/\\\_____\/\\\___\/\\\_____\/\\\_______\/\\\_____\//\\\______/\\\__      
    _\/\\\\\\\\\\\/____\/\\\\\\\\\\\/________\/\\\______\//\\\____/\\\___     
    _\/\\\//////\\\____\/\\\//////\\\________\/\\\_______\//\\\__/\\\____    
      _\/\\\____\//\\\___\/\\\____\//\\\_______\/\\\________\//\\\/\\\_____   
      _\/\\\_____\//\\\__\/\\\_____\//\\\______\/\\\_________\//\\\\\______  
        _\/\\\______\//\\\_\/\\\______\//\\\__/\\\\\\\\\\\______\//\\\_______ 
        _\///________\///__\///________\///__\///////////________\///________

River Restoration Intelligence and Verification  https://www.rriv.org
Copyright (C) 2020  Zaven Arra  zaven.arra@gmail.com
This program comes with ABSOLUTELY NO WARRANTY; for details type 'show-warranty'.
This is free software, and you are welcome to redistribute it
under certain conditions; type 'show-conditions' for details.
    `;
};

export const getUserInformation = () => {
  const user = getActiveUser();
  if (!user) {
    throw new Error("Unexpected Error; Shell startup");
  }
  const { lastLoginAt, currentLoginAt, name, toSync } = user;
  let text = `Welcome ${name}\nLast login at: ${new Date(lastLoginAt || currentLoginAt).toLocaleString()}`;
  const numberOfChanges = toSync.length;
  if (numberOfChanges) {
    text = `${text}\n${red(`You have ${numberOfChanges} unsynced changes`)}\n`;
  } else {
    text = `${text}\n`;
  }
  return text;
};

export const getLicense = () => {
  const license = fs.readFileSync("./LICENSE", { encoding: "utf-8" });
  return license;
};

export const getWarranty = () => {
  return String.raw`
THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY
APPLICABLE LAW.  EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT
HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY
OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE.  THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM
IS WITH YOU.  SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF
ALL NECESSARY SERVICING, REPAIR OR CORRECTION.
  `;
};
