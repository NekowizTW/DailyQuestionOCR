#!/usr/bin/env python3
import os
import json
import shutil
import urllib.request
from urllib.parse import unquote
import re

from PIL import Image
import easyocr

# define global parameter
results = []
list_filename = 'dailyQuestion.json'
output_folder = 'images'
output_filename = 'dailyQuestionOption.json'
reader = easyocr.Reader(['ch_tra','en'])

def fetchIDFromURL(url):
    unquoted = unquote(url)
    m = re.search('每日問答-(\d+)', unquoted)
    return m.group(0)

def recognizeImage(url, filename):
    # check the image is in directory or not
    # if true, copy to tmp.png, else download and backup to image directory.
    if os.path.exists(os.path.join(output_folder, filename + '.png')):
        shutil.copyfile(os.path.join(output_folder, filename + '.png'), 'tmp.png')
    else:
        im = Image.open(urllib.request.urlopen(url)).convert('RGB')
        im.save('tmp.png')
        shutil.copyfile('tmp.png', os.path.join(output_folder, filename + '.png'))

    # use easyocr to recognize image, ignore the guess under 0.8 probability
    result = reader.readtext('tmp.png')   
    filted = [item[1] for item in result if item[2] > 0.8]

    # print(filted)
    return filted

def main():
    # check directory is exist or not
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # load and recognize image
    with open(list_filename, 'r', encoding='utf8') as f:
        data = json.load(f)
        for idx, row in enumerate(data):
            thisID = fetchIDFromURL(row[0])
            print('[{idx:4d}/{total}]: {thisID}'.format(idx = idx + 1, total = len(data), thisID = thisID))
            recognized = recognizeImage(row[0], thisID)
            result = {
                'question': row[1],
                'answer': row[2],
                'recognized': recognized
            }
            results.append(result)

    # write the result
    with open(output_filename, 'w', encoding='utf8') as f:
        # ensure_ascii: True for unicode, False for native
        json.dump(results, f, indent = 4, ensure_ascii = False)

if __name__ == '__main__':
    main()