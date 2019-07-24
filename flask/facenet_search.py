from __future__ import print_function
import numpy as np
from sklearn.neighbors import NearestNeighbors
import timeit
import math

import glob
import argparse
import cv2

import sys
import os

from IPython import embed

fileDir = os.path.dirname(os.path.realpath(__file__))

def distance(embeddings1, embeddings2, distance_metric=0):
    if distance_metric==0:
        # Euclidian distance
        diff = np.subtract(embeddings1, embeddings2)
        dist = np.sum(np.square(diff),1)
    elif distance_metric==1:
        # Distance based on cosine similarity
        dot = np.sum(np.multiply(embeddings1, embeddings2), axis=1)
        norm = np.linalg.norm(embeddings1, axis=1) * np.linalg.norm(embeddings2, axis=1)
        similarity = dot / norm
        dist = np.arccos(similarity) / math.pi
    else:
        raise 'Undefined distance metric %d' % distance_metric 
        
    return dist

if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument('directory', type=str, nargs='+', help="Input images.")
    args = parser.parse_args()

    # dataset = np.load(os.path.join(args.directory[0], 'signatures.npy')).astype(np.float32)
    # with open(os.path.join(args.directory[0], 'names.txt')) as f:
    #     names = [args.directory[0] + "\\.." + os.path.join(a[1:].replace('/','\\')) for a in f.read().split('\n')]
    # names.sort()
    dataset = np.load(os.path.join(args.directory[0], 'embeddings.npy')).astype(np.float32)
    names = np.load(os.path.join(args.directory[0], 'label_strings.npy'))

    # embed()
    # dataset_file = 'dataset/glove.840B.300d.npy'
    number_of_queries = 20
    # we build only 50 tables, increasing this quantity will improve the query time
    # at a cost of slower preprocessing and larger memory footprint, feel free to
    # play with this number
    number_of_tables = 50

    # It's important not to use doubles, unless they are strictly necessary.
    # If your dataset consists of doubles, convert it to floats using `astype`.
    assert dataset.dtype == np.float32

    # Normalize all the lenghts, since we care about the cosine similarity.
    # print('Normalizing the dataset')
    # dataset /= np.linalg.norm(dataset, axis=1).reshape(-1, 1)
    # print('Done')

    # Choose random data points to be queries.
    print('Generating queries')
    # np.random.seed(4057218)
    # rng_state = numpy.random.get_state()
    # np.random.shuffle(dataset)
    # numpy.random.set_state(rng_state)
    queries = dataset[len(dataset) - number_of_queries:]
    dataset = dataset[:len(dataset) - number_of_queries]
    print('Done')

    # Perform linear scan using NumPy to get answers to the queries.
    print('Solving queries using linear scan')
    t1 = timeit.default_timer()
    answers = []
    for query in queries:
        answers.append((1/np.linalg.norm(dataset - query, axis=1)).argmax())
        # answers = distance(dataset, query, distance_metric=1)
    t2 = timeit.default_timer()
    print('Done')
    print('Linear scan time: {} per query'.format((t2 - t1) / float(
        len(queries))))

    # # Center the dataset and the queries: this improves the performance of LSH quite a bit.
    # print('Centering the dataset and queries')
    # center = np.mean(dataset, axis=0)
    # dataset -= center
    # queries -= center
    # print('Done')

    # params_cp = falconn.LSHConstructionParameters()   
    # params_cp.dimension = len(dataset[0])
    # params_cp.lsh_family = falconn.LSHFamily.CrossPolytope
    # # params_cp.lsh_family = falconn.LSHFamily.Hyperplane
    # params_cp.distance_function = falconn.DistanceFunction.EuclideanSquared
    # # params_cp.distance_function = falconn.DistanceFunction.NegativeInnerProduct
    # params_cp.l = number_of_tables
    # # we set one rotation, since the data is dense enough,
    # # for sparse data set it to 2
    # params_cp.num_rotations = 1
    # params_cp.seed = 5721840
    # # we want to use all the available threads to set up
    # params_cp.num_setup_threads = 0
    # params_cp.storage_hash_table = falconn.StorageHashTable.BitPackedFlatHashTable
    # # we build 18-bit hashes so that each table has
    # # 2^18 bins; this is a good choise since 2^18 is of the same
    # # order of magnitude as the number of data points
    # falconn.compute_number_of_hash_functions(17, params_cp)

    print('Constructing the LSH table')
    t1 = timeit.default_timer()
    # table = falconn.LSHIndex(params_cp)
    # table.setup(dataset)
    tree = NearestNeighbors(metric='cosine', leaf_size=30, algorithm='auto')
    tree.fit(dataset)
    t2 = timeit.default_timer()
    print('Done')
    print('Construction time: {}'.format(t2 - t1))

    import pickle

    with open('tree.pkl', 'wb') as f:
        pickle.dump(tree, f)

    # find the smallest number of probes to achieve accuracy 0.9
    # using the binary search
    # print('Choosing number of probes')
    # number_of_probes = number_of_tables

    # def evaluate_number_of_probes(number_of_probes):
    #     # query_object.set_num_probes(number_of_probes)
    #     score = 0
    #     for (i, query) in enumerate(queries):
    #         if answers[i] in tree.query(query.reshape(1,-1), k=1):
    #             score += 1
    #     return float(score) / len(queries)

    # # while True:
    # #     accuracy = evaluate_number_of_probes(number_of_probes)
    # #     print('{} -> {}'.format(number_of_probes, accuracy))
    # #     if accuracy >= 0.9:
    # #         break
    # #     number_of_probes = number_of_probes * 2
    # # if number_of_probes > number_of_tables:
    # #     left = number_of_probes // 2
    # #     right = number_of_probes
    # #     while right - left > 1:
    # #         number_of_probes = (left + right) // 2
    # #         accuracy = evaluate_number_of_probes(number_of_probes)
    # #         print('{} -> {}'.format(number_of_probes, accuracy))
    # #         if accuracy >= 0.9:
    # #             right = number_of_probes
    # #         else:
    # #             left = number_of_probes
    # #     number_of_probes = right
    # accuracy = evaluate_number_of_probes(number_of_probes)
    # print('{} -> {}'.format(number_of_probes, accuracy))
    # print('Done')
    # print('{} probes'.format(number_of_probes))

    # final evaluation
    t1 = timeit.default_timer()
    score = 0
    for (i, query) in enumerate(queries):
        if answers[i] in tree.kneighbors(query.reshape(1,-1), n_neighbors=1)[1]:
            score += 1
    t2 = timeit.default_timer()

    print('Query time: {}'.format((t2 - t1) / len(queries)))
    print('Precision: {}'.format(float(score) / len(queries)))



    # start = np.random.randint(0,920)
    start = 0

    # embed()

    for pic_to_find in range(start,start+20):
        actual_number = pic_to_find + len(dataset)
        distances, best_matches = tree.kneighbors(queries[pic_to_find].reshape(1,-1), n_neighbors=5)
        # distances, best_matches = [0, [[answers[pic_to_find]]]]
        file_path = os.path.join(args.directory[0],names[actual_number])
        print(file_path)
        img = cv2.resize(cv2.imread(file_path), (256,256))
        printStr = ": "
        for match in best_matches[0]:
            d = dataset[match] - queries[pic_to_find]
            printStr += " {}".format(np.dot(d,d))
            file_path = os.path.join(args.directory[0], names[match])
            print(file_path)
            img = np.concatenate((img, cv2.resize(cv2.imread(file_path), (256,256))), axis=1)

        print(str(actual_number) + printStr)
        cv2.imshow("A", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()