const supertest = require("supertest");

const server = require("./server.js");
const db = require("../data/dbConfig.js");

let key = "";
let key2 = "";
let postId = 0;
let stepId = 0;
let commentId = 0;

beforeAll(async()=>{
    await db("users").truncate();
})


describe("server", ()=>{
    it("can run the tests", ()=>{
        expect(true).toBeTruthy();
    })
    describe("GET /", ()=>{
        it("should return status code 200", ()=>{
            return supertest(server).get("/").then(res=>{
                expect(res.status).toBe(200);
            })
        })
        it("should return api:up", ()=>{
            return supertest(server).get("/").then(res=>{
                expect(res.body.api).toBe("up");
            })
        })
    })

    describe("----------AUTHORIZATION----------", ()=>{
        describe("POST /api/register", ()=>{
            it("Should return error 400 if missing username",()=>{
                const newData = {username: "", password: "test"}
                return supertest(server).post("/api/register").send(newData).then(res=>{
                    expect(res.status).toBe(400);
                })
            })
            it("Should return error 400 if missing password",()=>{
                const newData = {username: "test", password: ""}
                return supertest(server).post("/api/register").send(newData).then(res=>{
                    expect(res.status).toBe(400);
                })
            })
            it("Should return status 201 if successfully created account", ()=>{
                const newData = {username: "testaccount12345", password: "abc123"}
                return supertest(server).post("/api/register").send(newData).then(res=>{
                    expect(res.status).toBe(201);
                })
            })
            it("Should return the newly created user if successfully created account", ()=>{
                const newData = {username: "testaccount123456", password: "abc123"}
                return supertest(server).post("/api/register").send(newData).then(res=>{
                    expect(res.body.data.username).toBe("testaccount123456");
                })
            })
        })
        describe("POST /api/login", ()=>{
            it("Should return error 401 if invalid credentials", ()=>{
                const newData = {username: "testaccount12345", password: "abc1234"}
                return supertest(server).post("/api/login").send(newData).then(res=>{
                    expect(res.status).toBe(401);
                })
            })
            it("Should return error 400 if username is missing",()=>{
                const newData = {username: "", password: "test"}
                return supertest(server).post("/api/login").send(newData).then(res=>{
                    expect(res.status).toBe(400);
                })
            })
            it("Should return error 400 if password is missing",()=>{
                const newData = {username: "test", password: ""}
                return supertest(server).post("/api/login").send(newData).then(res=>{
                    expect(res.status).toBe(400);
                })
            })
            it("Should return status 200 if successful login", ()=>{
                const newData = {username: "testaccount12345", password: "abc123"}
                return supertest(server).post("/api/login").send(newData).then(res=>{
                    key = res.body.toString();
                    expect(res.status).toBe(200);
                })
            })
            it("Should return the token if successful login", ()=>{
                const newData = {username: "testaccount123456", password: "abc123"}
                return supertest(server).post("/api/login").send(newData).then(res=>{
                    key2 = res.body.toString();
                    expect(key2.length).toBeGreaterThan(0);
                })
            })
        })
        describe("GET /api/users",()=>{
            it("Should return error 401 if unauthorized", ()=>{
                return supertest(server).get("/api/users").then(res=>{
                    expect(res.status).toBe(401);
                })
            })
            it("Should return status 200 if authorized", ()=>{
                return supertest(server).get("/api/users").set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(200)
                })
            })
            it("Should return an array of users if authorized", ()=>{
                return supertest(server).get("/api/users").set({"authorization": key}).then(res=>{
                    expect(Array.isArray(res.body)).toBe(true);
                })
            })
        })
        describe("GET /api/users/:id", ()=>{
            it("Should return error 401 if unauthorized", ()=>{
                return supertest(server).get("/api/users/1").then(res=>{
                    expect(res.status).toBe(401);
                })
            })
            it("Should return status 200 if authorized", ()=>{
                return supertest(server).get("/api/users/1").set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(200)
                })
            })
            it("Should return a single user if authorized", ()=>{
                return supertest(server).get("/api/users/1").set({"authorization": key}).then(res=>{
                    expect(res.body.id).toBe(1);
                })
            })
            it("Should return error 404 if no user found", ()=>{
                return supertest(server).get("/api/users/99999999").set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(404);
                })
            })
        })
    })
    describe("----------LIFE HACKS----------", ()=>{
        describe("POST /api/hacks", ()=>{
            it("Should return error 401 if unauthorized", ()=>{
                const newPost = {title: "testTitle", description: "testDesc"}
                return supertest(server).post("/api/hacks").send(newPost).then(res=>{
                    expect(res.status).toBe(401)
                })
            })
            it("Should return error 400 if authorized but missing title", ()=>{
                const newPost = {title: "", description: "test"}
                return supertest(server).post("/api/hacks").set({"authorization": key}).send(newPost).then(res=>{
                    expect(res.status).toBe(400)
                })
            })
            it("Should return error 400 if authorized but missing description", ()=>{
                const newPost = {title: "test", description: ""}
                return supertest(server).post("/api/hacks").set({"authorization": key}).send(newPost).then(res=>{
                    expect(res.status).toBe(400)
                })
            })
            it("Should return status 201 if authorized and successful post creation", ()=>{
                const newPost = {title: "testTitle", description: "testDesc"}
                return supertest(server).post("/api/hacks").set({"authorization": key}).send(newPost).then(res=>{
                    expect(res.status).toBe(201);
                })
            })
            it("Should return the new post data if authorized and successful post creation", ()=>{
                const newPost = {title: "testTitle2", description: "testDesc2"}
                return supertest(server).post("/api/hacks").set({"authorization": key}).send(newPost).then(res=>{
                    postId = res.body.id
                    expect(res.body.title).toBe("testTitle2")
                    expect(res.body.description).toBe("testDesc2")
                })
            })
        })
        describe("GET /api/hacks", ()=>{
            it("Should return error 401 if unauthorized", ()=>{
                return supertest(server).get("/api/hacks").then(res=>{
                    expect(res.status).toBe(401);
                })
            })
            it("Should return status 200 if authorized", ()=>{
                return supertest(server).get("/api/hacks").set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(200);
                })
            })
            it("Should return an array of the life hacks if authorized", ()=>{
                return supertest(server).get("/api/hacks").set({"authorization": key}).then(res=>{
                    expect(Array.isArray(res.body)).toBe(true);
                })
            })
        })
        describe("GET /api/hacks/:id", ()=>{
            it("Should return error 401 if unauthorized", ()=>{
                return supertest(server).get(`/api/hacks/${postId}`).then(res=>{
                    expect(res.status).toBe(401)
                })
            })
            it("Should return status 200 if authorized", ()=>{
                return supertest(server).get(`/api/hacks/${postId}`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(200);
                })
            })
            it("Should return the post with the specified ID if authorized", ()=>{
                return supertest(server).get(`/api/hacks/${postId}`).set({"authorization": key}).then(res=>{
                    expect(res.body.id).toBe(postId);
                })
            })
            it("Should return error 404 if authorized and post is not found", ()=>{
                return supertest(server).get('/api/hacks/0').set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(404);
                })
            })
        })
        describe("PUT /api/hacks/:id",()=>{
            it("Should return status 401 if unauthorized", ()=>{
                const updateData = {title: "newTitle", description: "newerDescription"}
                return supertest(server).put(`/api/hacks/${postId}`).send(updateData).then(res=>{
                    expect(res.status).toBe(401)
                })
            })
            it("Should return status 400 if authorized and missing title", ()=>{
                const updateData = {description: "fhioasefhioefhiofse"}
                return supertest(server).put(`/api/hacks/${postId}`).set({"authorization": key }).send(updateData).then(res=>{
                    expect(res.status).toBe(400)
                })
            })
            it("Should return status 400 if authorized and missing description", ()=>{
                const updateData = {title: "apaoehiegwaopihagiono"}
                return supertest(server).put(`/api/hacks/${postId}`).set({"authorization": key }).send(updateData).then(res=>{
                    expect(res.status).toBe(400)
                })
            })
            it("Should return status 403 if attempt to PUT performed by account that did not create post", ()=>{
                const updateData =  {title: "newTitle", description: "newerDescription"}
                return supertest(server).put(`/api/hacks/${postId}`).set({"authorization": key2}).send(updateData).then(res=>{
                    expect(res.status).toBe(403)
                })
            })
            it("Should return status 200 if authorized and successfully updated post", ()=>{
                const updateData = {title: "updated title", description: "updatedDesc"}
                return supertest(server).put(`/api/hacks/${postId}`).set({"authorization": key}).send(updateData).then(res=>{
                    expect(res.status).toBe(200)
                })
            })
            it("Should return the updated life hack if authorized and updated successfully", ()=>{
                const updateData = {title: "newer title", description: "newer description"}
                return supertest(server).put(`/api/hacks/${postId}`).set({"authorization": key}).send(updateData).then(res=>{
                    expect(res.body.title).toBe("newer title")
                    expect(res.body.description).toBe("newer description")
                })
            })
        })
        describe("PATCH /api/hacks/:id/upvote", ()=>{
            it("Should return error 401 if unauthorized", ()=>{
                return supertest(server).patch(`/api/hacks/${postId}/upvote`).then(res=>{
                    expect(res.status).toBe(401)
                })
            })
            it("Should return status 200 if authorized", ()=>{
                return supertest(server).patch(`/api/hacks/${postId}/upvote`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(200);
                })
            })
            it("Should return post object with score + 1 if authorized", ()=>{
                let initialScore = 0;
                supertest(server).get(`/api/hacks/${postId}`).set({"authorization": key}).then(res=>{
                    initialScore = res.body.score;
                })
                return supertest(server).patch(`/api/hacks/${postId}/upvote`).set({"authorization": key}).then(res=>{
                    expect(res.body.score).toBe(initialScore + 1)
                })
            })
        })
        describe("PATCH /api/hacks/:id/downvote", ()=>{
            it("Should return error 401 if unauthorized", ()=>{
                return supertest(server).patch(`/api/hacks/${postId}/downvote`).then(res=>{
                    expect(res.status).toBe(401)
                })
            })
            it("Should return status 200 if authorized", ()=>{
                return supertest(server).patch(`/api/hacks/${postId}/downvote`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(200);
                })
            })
            it("Should return post object with score - 1 if authorized", ()=>{
                let initialScore = 0;
                supertest(server).get(`/api/hacks/${postId}`).set({"authorization": key}).then(res=>{
                    initialScore = res.body.score;
                })
                return supertest(server).patch(`/api/hacks/${postId}/downvote`).set({"authorization": key}).then(res=>{
                    expect(res.body.score).toBe(initialScore - 1)
                })
            })
        })
    })
    describe("----------LIFE HACK STEPS----------", ()=>{
        describe("POST /api/hacks/:id/steps",()=>{
            it("Should return error 401 if unauthorized", ()=>{
                const newStep = {step_number: 1, instruction: "do the thing"}
                return supertest(server).post(`/api/hacks/${postId}/steps`).send(newStep).then(res=>{
                    expect(res.status).toBe(401)
                })
            })
            it("Should return error 400 if missing step_number", ()=>{
                const newStep = {instruction: "do the thing"}
                return supertest(server).post(`/api/hacks/${postId}/steps`).set({"authorization": key}).send(newStep).then(res=>{
                    expect(res.status).toBe(400)
                })
            })
            it("Should return error 400 if missing instruction", ()=>{
                const newStep = {step_number: 1}
                return supertest(server).post(`/api/hacks/${postId}/steps`).set({"authorization": key}).send(newStep).then(res=>{
                    expect(res.status).toBe(400)
                })
            })
            it("Should return error 403 if adding step attempted by foreign user", ()=>{
                const newStep = {step_number: 1, instruction: "do the thing"}
                return supertest(server).post(`/api/hacks/${postId}/steps`).set({"authorization": key2}).send(newStep).then(res=>{
                    expect(res.status).toBe(403)
                })
            })
            it("Should return error 404 if life hack id does not exist",()=>{
                const newStep = {step_number: 1, instruction: "do the thing"}
                return supertest(server).post(`/api/hacks/0/steps`).set({"authorization": key}).send(newStep).then(res=>{
                    expect(res.status).toBe(404)
                })
            })
            it("Should return status 201 if adding new step success", ()=>{
                const newStep = {step_number: 1, instruction: "do the thing"}
                return supertest(server).post(`/api/hacks/${postId}/steps`).set({"authorization": key}).send(newStep).then(res=>{
                    stepId = res.body.id;
                    expect(res.status).toBe(201)
                })
            })
            it("Should return the newly created step if success", ()=>{
                const newStep = {step_number: 2, instruction: "do the thing again"}
                return supertest(server).post(`/api/hacks/${postId}/steps`).set({"authorization": key}).send(newStep).then(res=>{
                    expect(res.body.step_number).toBe(2)
                    expect(res.body.instruction).toBe("do the thing again")
                })
            })
        })
        describe("GET /api/hacks/:id/steps", ()=>{
            it("Should return error 401 if not authorized", ()=>{
                return supertest(server).get(`/api/hacks/${postId}/steps`).then(res=>{
                    expect(res.status).toBe(401)
                })
            })
            it("Should return error 404 if life hack not found", ()=>{
                return supertest(server).get(`/api/hacks/0/steps`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(404)
                })
            })
            it("Should return status 200 if authorized", ()=>{
                return supertest(server).get(`/api/hacks/${postId}/steps`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(200)
                })
            })
            it("Should return an array of steps if authorized", ()=>{
                return supertest(server).get(`/api/hacks/${postId}/steps`).set({"authorization": key}).then(res=>{
                    expect(Array.isArray(res.body)).toBe(true);
                })
            })
        })
        describe("PUT /api/hacks/:id/steps/:stepId", ()=>{
            it("Should return error 401 if unauthorized", ()=>{
                const updateStep = {step_number: 3, instruction: "im tired of typing"}
                return supertest(server).put(`/api/hacks/${postId}/steps/${stepId}`).send(updateStep).then(res=>{
                    expect(res.status).toBe(401)
                })
            })
            it("Should return error 400 if step number is missing", ()=>{
                const updateStep = {instruction: "this is line 369 of repetitve test functions and I would really like to be done"}
                return supertest(server).put(`/api/hacks/${postId}/steps/${stepId}`).set({"authorization": key}).send(updateStep).then(res=>{
                    expect(res.status).toBe(400)
                })
            })
            it("Should return error 400 if instruction is missing", ()=>{
                const updateStep = {step_number: 420}
                return supertest(server).put(`/api/hacks/${postId}/steps/${stepId}`).set({"authorization": key}).send(updateStep).then(res=>{
                    expect(res.status).toBe(400)
                })
            })
            it("Should return error 403 if step number edit attempted by foreign user", ()=>{
                const updateStep = {step_number: 1, instruction: "help"}
                return supertest(server).put(`/api/hacks/${postId}/steps/${stepId}`).set({"authorization": key2}).send(updateStep).then(res=>{
                    expect(res.status).toBe(403)
                })
            })
            it("Should return error 404 if hack id doesn't exist", ()=>{
                const updateStep = {step_number: 1, instruction: "weeee"}
                return supertest(server).put(`/api/hacks/0/steps/${stepId}`).set({"authorization": key}).send(updateStep).then(res=>{
                    expect(res.status).toBe(404)
                })
            })
            it("Should return error 404 if step id doesn't exist", ()=>{
                const updateStep = {step_number: 1, instruction: "weeee"}
                return supertest(server).put(`/api/hacks/${postId}/steps/0`).set({"authorization": key}).send(updateStep).then(res=>{
                    expect(res.status).toBe(404)
                })
            })
            it("Should return status 200 if successful update", ()=>{
                const updateStep = {step_number: 1, instruction: "fix the thing"}
                return supertest(server).put(`/api/hacks/${postId}/steps/${stepId}`).set({"authorization": key}).send(updateStep).then(res=>{
                    expect(res.status).toBe(200)
                })
            })
            it("Should return updated step if successful update", ()=>{
                const updateStep = {step_number: 3, instruction: "do the third step"}
                return supertest(server).put(`/api/hacks/${postId}/steps/${stepId}`).set({"authorization": key}).send(updateStep).then(res=>{
                    expect(res.body.step_number).toBe(3)
                    expect(res.body.instruction).toBe("do the third step")
                })
            })
        })
    })
    describe("----------LIFE HACK COMMENTS----------", ()=>{
        describe("POST /api/hacks/:id/comments", ()=>{
            it("Should return error 401 if unauthorized", ()=>{
                const newComment = {comment_text: "this is a comment"}
                return supertest(server).post(`/api/hacks/${postId}/comments`).send(newComment).then(res=>{
                    expect(res.status).toBe(401)
                })
            })
            it("Should return error 400 if no comment_text", ()=>{
                const newComment = {comment_text: ""}
                return supertest(server).post(`/api/hacks/${postId}/comments`).set({"authorization": key}).send(newComment).then(res=>{
                    expect(res.status).toBe(400)
                })
            })
            it("Should return status 201 if new comment created", ()=>{
                const newComment = {comment_text: "this is a comment"}
                return supertest(server).post(`/api/hacks/${postId}/comments`).set({"authorization": key}).send(newComment).then(res=>{
                    commentId = res.body.id
                    expect(res.status).toBe(201)
                })
            })
            it("Should return new comment if new comment created successfully", ()=>{
                const newComment = {comment_text: "this is also a comment"}
                return supertest(server).post(`/api/hacks/${postId}/comments`).set({"authorization": key}).send(newComment).then(res=>{
                    expect(res.body.comment_text).toBe("this is also a comment")
                })
            })
        })
        describe("GET /api/hacks/:id/comments", ()=>{
            it("Should return error 401 if unauthorized", ()=>{
                return supertest(server).get(`/api/hacks/${postId}/comments`).then(res=>{
                    expect(res.status).toBe(401)
                })
            })
            it("Should return 404 if life hack is not found", ()=>{
                return supertest(server).get(`/api/hacks/0/comments`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(404)
                })
            })
            it("Should return 200 if authorized", ()=>{
                return supertest(server).get(`/api/hacks/${postId}/comments`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(200)
                })
            })
            it("Should return an array of comments if authorized", ()=>{
                return supertest(server).get(`/api/hacks/${postId}/comments`).set({"authorization": key}).then(res=>{
                    expect(Array.isArray(res.body)).toBe(true)
                })
            })
        })
    })
    describe("----------DELETING STUFF----------", ()=>{
        describe("DELETE /api/hacks/:id/comments/:commId", ()=>{
            it("Should return error 401 if unauthorized", ()=>{
                return supertest(server).delete(`/api/hacks/${postId}/comments/${commentId}`).then(res=>{
                    expect(res.status).toBe(401)
                })
            })
            it("Should return error 404 if life hack doesn't exist", ()=>{
                return supertest(server).delete(`/api/hacks/0/comments/${commentId}`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(404)
                })
            })
            it("Should return status 200 if comment already doesn't exist", ()=>{
                return supertest(server).delete(`/api/hacks/${postId}/comments/0`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(200)
                })
            })
            it("Should return error 403 if comment delete attempted by foreign user", ()=>{
                return supertest(server).delete(`/api/hacks/${postId}/comments/${commentId}`).set({"authorization": key2}).then(res=>{
                    expect(res.status).toBe(403)
                })
            })
            it("Should return status 200 if successfully deleted comment", ()=>{
                return supertest(server).delete(`/api/hacks/${postId}/comments/${commentId}`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(200)
                })
            })
            it("Should return comment array minus deleted comment if successfully deleted comment", ()=>{
                return supertest(server).delete(`/api/hacks/${postId}/comments/${commentId}`).set({"authorization": key}).then(res=>{
                    expect(Array.isArray(res.body)).toBe(true);
                })
            })
        })
        describe("DELETE /api/hacks/:id/steps/:stepId", ()=>{
            it("Should return error 401 if unauthorized", ()=>{
                return supertest(server).delete(`/api/hacks/${postId}/steps/${stepId}`).then(res=>{
                    expect(res.status).toBe(401)
                })
            })
            it("Should return error 404 if life hack doesn't exist", ()=>{
                return supertest(server).delete(`/api/hacks/0/steps/${stepId}`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(404)
                })
            })
            it("Should return error 404 if step doesn't exist", ()=>{
                return supertest(server).delete(`/api/hacks/${postId}/steps/0`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(404)
                })
            })
            it("Should return error 403 if step delete attempted by foreign user", ()=>{
                return supertest(server).delete(`/api/hacks/${postId}/steps/${stepId}`).set({"authorization": key2}).then(res=>{
                    expect(res.status).toBe(403)
                })
            })
            it("Should return status 200 and array of steps minus deleted one if successfully deleted step", ()=>{
                return supertest(server).delete(`/api/hacks/${postId}/steps/${stepId}`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(200)
                    expect(Array.isArray(res.body)).toBe(true)
                })
            })
        })
        describe("DELETE /api/hacks/:id", ()=>{
            it("Should return error 401 if unauthorized", ()=>{
                return supertest(server).delete(`/api/hacks/${postId}`).then(res=>{
                    expect(res.status).toBe(401)
                })
            })
            it("Should return error 404 if life hack doesn't exist", ()=>{
                return supertest(server).delete(`/api/hacks/0`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(404)
                })
            })
            it("Should return error 403 if life hack delete attempted by foreign user", ()=>{
                return supertest(server).delete(`/api/hacks/${postId}`).set({"authorization": key2}).then(res=>{
                    expect(res.status).toBe(403)
                })
            })
            it("Should return status 200 and array of life hacks minus deleted one if life hack delete successful", ()=>{
                return supertest(server).delete(`/api/hacks/${postId}`).set({"authorization": key}).then(res=>{
                    expect(res.status).toBe(200)
                    expect(Array.isArray(res.body)).toBe(true)
                })
            })
        })
    })
})