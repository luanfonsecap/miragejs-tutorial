import {
  createServer,
  Model,
  hasMany,
  belongsTo,
  RestSerializer,
  Factory,
  trait,
} from "miragejs";
import faker from "@faker-js/faker";

export default function (environment = "development") {
  return createServer({
    environment: environment,

    serializers: {
      reminder: RestSerializer.extend({
        include: ["list"],
        embed: true,
      }),
    },

    models: {
      list: Model.extend({
        reminders: hasMany(),
      }),

      reminder: Model.extend({
        list: belongsTo(),
      }),
    },

    factories: {
      list: Factory.extend({
        name(i) {
          return `List ${faker.lorem.sentence(i)}`;
        },

        withReminders: trait({
          afterCreate(list, server) {
            server.createList("reminder", 5, { list });
          },
        }),
      }),

      reminder: Factory.extend({
        text(i) {
          return faker.lorem.sentence(i);
        },
      }),
    },

    seeds(server) {
      server.create("reminder", { text: "Walk the dog" });
      server.create("reminder", { text: "Take out the trash" });
      server.create("reminder", { text: "Work out" });

      server.create("list", {
        name: "Home",
        reminders: [server.create("reminder", { text: "Do taxes" })],
      });

      server.create("list", {
        name: "Work",
        reminders: [server.create("reminder", { text: "Visit bank" })],
      });

      // server.create("list", {
      //   name: "Home",
      //   reminders: [server.create("reminder", { text: "Do taxes" })],
      // });

      // server.create("list", "withReminders");

      // server.createList("reminder", 4);
    },

    routes() {
      this.get("/api/lists", (schema, request) => {
        return schema.lists.all();
      });

      this.get("/api/reminders", (schema) => {
        return schema.reminders.all();
      });

      this.post("/api/reminders", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);

        return schema.reminders.create(attrs);
      });

      this.delete("/api/reminders/:id", (schema, request) => {
        const id = request.params.id;

        return schema.reminders.find(id).destroy();
      });

      this.get("/api/lists/:id/reminders", (schema, request) => {
        const listId = request.params.id;
        const list = schema.lists.find(listId);

        return list.reminders;
      });
    },
  });
}
