/*
* @Author: aFei
* @Date: 2019-05-08 14:48:32
*/
/*
* @LastEditors: aFei
* @LastEditTime: 2019-05-08 14:48:34
*/
import vuePuzzleSlider from './vuePuzzleSlider';

const comment = {
    install(Vue) {
        Vue.component('vuePuzzleSlider', vuePuzzleSlider);
    },
};
if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(comment);
}

export default comment;