import {LeetCodeAdapter} from './leetcode/adapter';const a=new LeetCodeAdapter();if(a.isPage())a.observe(submission=>chrome.runtime.sendMessage({type:'LEETCODE_ACCEPTED',submission}));
